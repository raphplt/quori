import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { Queue } from 'bullmq';
import { Observable, Subject, from } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import * as crypto from 'crypto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installation } from './entities/installation.entity';
import { Event as GithubEvent, EventType } from './entities/event.entity';
import { Post } from './entities/post.entity';
import { parseGitEvent } from './parse-git-event';

@Injectable()
export class GithubAppService {
  private cache = new Map<number, { token: string; expires: number }>();
  private queue: Queue<Record<string, unknown>>;
  private eventSubject = new Subject<GithubEvent>();

  constructor(
    private config: ConfigService,
    @InjectRepository(Installation)
    private installations: Repository<Installation>,
    @InjectRepository(GithubEvent)
    private events: Repository<GithubEvent>,
    @InjectRepository(Post)
    private posts: Repository<Post>,
  ) {
    this.queue = new Queue<Record<string, unknown>>('github-events', {
      connection: {
        url: this.config.get<string>('REDIS_URL'),
      },
    });
  }

  verifySignature(req: Request): void {
    const secret = this.config.get<string>('GITHUB_WEBHOOK_SECRET');
    if (!secret) {
      throw new UnauthorizedException(
        'GITHUB_WEBHOOK_SECRET not configured in environment variables',
      );
    }
    const sig = req.headers['x-hub-signature-256'] as string | undefined;
    if (!sig) throw new UnauthorizedException('Missing signature');
    const payload = (req as unknown as { rawBody?: string }).rawBody ?? '';
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig))) {
      throw new UnauthorizedException('Invalid signature');
    }
  }

  async enqueueEvent(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const exists = await this.queue.getJob(id);
    if (exists) return;
    await this.queue.add('event', payload, { jobId: id });
  }

  private generateJwt(): string {
    const appId = this.config.get<string>('GITHUB_APP_ID')!;
    const privateKey = this.config.get<string>('GITHUB_APP_PRIVATE_KEY')!;
    const now = Math.floor(Date.now() / 1000);
    return sign({ iss: appId, iat: now, exp: now + 600 }, privateKey, {
      algorithm: 'RS256',
    });
  }

  async getInstallationToken(installationId: number): Promise<string> {
    const cached = this.cache.get(installationId);
    if (cached && cached.expires > Date.now()) return cached.token;
    const jwt = this.generateJwt();
    const octokit = new Octokit({ auth: jwt });
    const { data } = await octokit.request(
      'POST /app/installations/{installation_id}/access_tokens',
      { installation_id: installationId },
    );
    this.cache.set(installationId, {
      token: data.token,
      expires: new Date(data.expires_at).getTime() - 60 * 1000,
    });
    return data.token;
  }

  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    const token = await this.getInstallationToken(installationId);
    return new Octokit({ auth: token });
  }

  /**
   * Synchronise les installations GitHub avec la base de données
   * Récupère toutes les installations via l'API GitHub et les met à jour en BDD
   */
  async syncInstallationsFromGitHub(): Promise<Installation[]> {
    try {
      const jwt = this.generateJwt();
      const octokit = new Octokit({ auth: jwt });

      console.log('🔄 Syncing installations from GitHub...');

      // Récupérer toutes les installations de l'app GitHub
      const { data: installations } = await octokit.request(
        'GET /app/installations',
      );

      console.log(`📥 Found ${installations.length} installations on GitHub`);

      const syncedInstallations: Installation[] = [];

      for (const installation of installations) {
        try {
          // Récupérer les dépôts pour cette installation
          const installationOctokit = await this.getInstallationOctokit(
            installation.id,
          );
          const { data: repos } = await installationOctokit.request(
            'GET /installation/repositories',
          );

          const repoNames = repos.repositories.map((repo) => repo.full_name);

          // Déterminer le nom de compte selon le type (User ou Organization)
          const accountLogin =
            'login' in (installation.account || {})
              ? (installation.account as { login: string }).login
              : (installation.account as { name: string })?.name || '';

          console.log(
            `📦 Installation ${installation.id} (${accountLogin}) has ${repoNames.length} repos`,
          );

          // Upsert l'installation en BDD
          const savedInstallation = await this.installations.save({
            id: installation.id,
            account_login: accountLogin,
            account_id: installation.account?.id || 0,
            repos: repoNames,
            created_at: new Date(installation.created_at),
          });

          syncedInstallations.push(savedInstallation);
        } catch (error) {
          console.error(
            `❌ Failed to sync installation ${installation.id}:`,
            error,
          );
        }
      }

      console.log(
        `✅ Successfully synced ${syncedInstallations.length} installations`,
      );
      return syncedInstallations;
    } catch (error) {
      console.error('❌ Failed to sync installations from GitHub:', error);
      throw error;
    }
  }

  /**
   * Synchronise les installations pour un utilisateur spécifique
   * Utilise l'API GitHub App avec JWT pour récupérer toutes les installations
   * puis filtre celles qui appartiennent à l'utilisateur
   */
  async syncUserInstallationsFromGitHub(
    githubAccessToken: string,
    githubId: string,
  ): Promise<Installation[]> {
    try {
      console.log(`🔄 Syncing installations for user ${githubId}...`);

      // D'abord, synchroniser toutes les installations via l'API GitHub App
      const allInstallations = await this.syncInstallationsFromGitHub();

      // Ensuite, filtrer celles qui appartiennent à l'utilisateur
      const userInstallations = allInstallations.filter(
        (installation) => installation.account_id.toString() === githubId,
      );

      console.log(
        `✅ Found ${userInstallations.length} installations for user ${githubId} out of ${allInstallations.length} total`,
      );

      return userInstallations;
    } catch (error) {
      console.error(
        `❌ Failed to sync installations for user ${githubId}:`,
        error,
      );
      throw error;
    }
  }

  async upsertInstallation(data: {
    installation_id: number;
    account_login: string;
    account_id: number;
    repositories: string[];
  }): Promise<void> {
    await this.installations.save({
      id: data.installation_id,
      account_login: data.account_login,
      account_id: data.account_id,
      repos: data.repositories,
    });
  }

  async removeInstallation(id: number): Promise<void> {
    // Utiliser une transaction pour s'assurer que toutes les suppressions sont atomiques
    await this.installations.manager.transaction(
      async (transactionalEntityManager) => {
        // D'abord, supprimer tous les posts liés à cette installation
        await transactionalEntityManager
          .getRepository(Post)
          .delete({ installation: { id } });

        // Ensuite, supprimer tous les événements liés à cette installation
        await transactionalEntityManager
          .getRepository(GithubEvent)
          .delete({ installation: { id } });

        // Enfin, supprimer l'installation elle-même
        await transactionalEntityManager
          .getRepository(Installation)
          .delete({ id });
      },
    );
  }

  async updateRepos(id: number, repos: string[]): Promise<void> {
    await this.installations.update({ id: id }, { repos });
  }

  async getInstallationRepos(id: number): Promise<string[]> {
    const inst = await this.installations.findOne({
      where: { id: id },
    });
    return inst?.repos || [];
  }

  async getAllInstallations(): Promise<Installation[]> {
    return this.installations.find();
  }

  async getUserInstallations(githubId: string): Promise<Installation[]> {
    const githubIdNum = parseInt(githubId, 10);
    return this.installations.find({
      where: { account_id: githubIdNum },
    });
  }

  async getInstallationById(id: number): Promise<Installation | null> {
    return this.installations.findOne({
      where: { id },
    });
  }

  getInstallationUrl(): string {
    const appId = this.config.get<string>('GITHUB_APP_ID');
    if (!appId) {
      throw new Error('GITHUB_APP_ID not configured');
    }
    return `https://github.com/apps/${this.config.get<string>('GITHUB_APP_SLUG', 'quori-dev')}/installations/new`;
  }

  getEventStream(): Observable<GithubEvent> {
    return this.eventSubject.asObservable();
  }

  getEventsCountStream(): Observable<number> {
    return this.eventSubject.asObservable().pipe(
      startWith(null),
      switchMap(() => {
        return from(this.getEventsCount());
      }),
    );
  }

  async getRecentEvents(limit = 20): Promise<GithubEvent[]> {
    return this.events.find({
      order: { received_at: 'DESC' },
      take: limit,
    });
  }

  async getEventsCount(): Promise<number> {
    return this.events.count();
  }

  async getEventsPaginated(
    page = 1,
    limit = 10,
  ): Promise<{
    events: GithubEvent[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const offset = (page - 1) * limit;

    const [events, total] = await this.events.findAndCount({
      order: { received_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async getEventById(id: string): Promise<GithubEvent | null> {
    return this.events.findOne({
      where: { delivery_id: id },
    });
  }

  private mapEventToType(event: string): EventType {
    switch (event) {
      case 'push':
        return 'push';
      case 'pull_request':
        return 'pull_request';
      case 'issues':
        return 'issues';
      case 'release':
        return 'release';
      case 'fork':
        return 'fork';
      case 'watch':
        return 'star';
      case 'create':
        return 'create';
      case 'delete':
        return 'delete';
      case 'workflow_run':
        return 'workflow_run';
      default:
        return 'other';
    }
  }

  async recordEvent(
    delivery: string,
    installationId: number,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const exists = await this.events.findOne({
      where: { delivery_id: delivery },
    });
    if (exists) return;

    let installation = await this.installations.findOne({
      where: { id: installationId },
    });

    if (!installation) {
      // Auto-create installation from webhook payload
      const webhookPayload = payload as {
        sender?: { login?: string; id?: number };
        repository?: { full_name?: string };
      };

      if (
        webhookPayload.sender?.login &&
        webhookPayload.repository?.full_name
      ) {
        await this.upsertInstallation({
          installation_id: installationId,
          account_login: webhookPayload.sender.login,
          account_id: webhookPayload.sender.id || 0,
          repositories: [webhookPayload.repository.full_name],
        });

        installation = await this.installations.findOne({
          where: { id: installationId },
        });
        if (!installation) return;
      } else {
        return;
      }
    }

    // Type-safe extraction of repository full name
    const repoFullName =
      (payload as { repository?: { full_name?: string } }).repository
        ?.full_name ?? '';

    // Extract author information
    const author = (
      payload as {
        sender?: { login?: string; avatar_url?: string };
      }
    ).sender;

    // Determine event type
    const eventType = this.mapEventToType(event);

    let metadata: Record<string, unknown> | undefined;

    try {
      const octokit = await this.getInstallationOctokit(installationId);
      const parsedEvent = await parseGitEvent(payload, event, octokit);
      metadata = {
        title: parsedEvent.title,
        desc: parsedEvent.desc,
        filesChanged: parsedEvent.filesChanged,
        diffStats: parsedEvent.diffStats,
      };
    } catch (error) {
      console.warn(
        'Failed to parse event with Octokit, falling back without API calls:',
        error,
      );
      const parsedEvent = await parseGitEvent(payload, event);
      metadata = {
        title: parsedEvent.title,
        desc: parsedEvent.desc,
        filesChanged: parsedEvent.filesChanged,
        diffStats: parsedEvent.diffStats,
      };
    }

    const savedEvent = await this.events.save({
      delivery_id: delivery,
      installation,
      event,
      event_type: eventType,
      payload,
      repo_full_name: repoFullName,
      author_login: author?.login,
      author_avatar_url: author?.avatar_url,
      metadata,
      status: 'pending',
    });

    this.eventSubject.next(savedEvent);
    await this.queue.add(event, { delivery_id: delivery });
  }

  async savePost(data: {
    installationId: number;
    repo: string;
    eventType: string;
    content: string;
  }): Promise<void> {
    const installation = await this.installations.findOne({
      where: { id: data.installationId },
    });
    if (!installation) return;
    await this.posts.save({
      installation,
      repo_full_name: data.repo,
      event_type: data.eventType,
      content_draft: data.content,
    });
  }

  async createTestEvent(): Promise<GithubEvent> {
    const testEvent = {
      delivery_id: `test-${Date.now()}`,
      event: 'push',
      payload: {
        repository: {
          full_name: 'test/repo',
          name: 'repo',
          owner: { login: 'test' },
        },
        head_commit: {
          message: 'Test commit for activity feed',
          added: ['test.txt'],
          modified: [],
          removed: [],
        },
      },
      repo_full_name: 'test/repo',
      metadata: {
        title: 'Test commit for activity feed',
        desc: 'This is a test commit to verify the activity feed is working',
        filesChanged: ['test.txt'],
        diffStats: [
          {
            filePath: 'test.txt',
            additions: 5,
            deletions: 0,
            changes: 5,
          },
        ],
      },
    };

    const saved = await this.events.save(testEvent);
    this.eventSubject.next(saved);
    return saved;
  }

  /**
   * Force la synchronisation de toutes les installations depuis GitHub
   * Utile pour déboguer ou forcer la mise à jour
   */
  async forceSyncAllInstallations(): Promise<Installation[]> {
    console.log('🔄 Force syncing ALL installations from GitHub...');

    try {
      // Vider d'abord toutes les installations en BDD (optionnel)
      // await this.installations.clear();

      // Synchroniser depuis GitHub
      const syncedInstallations = await this.syncInstallationsFromGitHub();

      console.log(
        `✅ Force sync completed: ${syncedInstallations.length} installations`,
      );

      return syncedInstallations;
    } catch (error) {
      console.error('❌ Failed to force sync installations:', error);
      throw error;
    }
  }
}
