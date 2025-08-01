import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { Queue } from 'bullmq';
import { Observable, Subject, from, interval, merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Installation } from './entities/installation.entity';
import { Event as GithubEvent, EventType } from './entities/event.entity';
import { Post } from './entities/post.entity';

interface GitHubAccount {
  id: number;
  login?: string;
  name?: string | null;
}

interface GitHubInstallation {
  id: number;
  account?: GitHubAccount | null;
  created_at: string;
}

interface PostsStats {
  drafts: number;
  ready: number;
  scheduled: number;
  published: number;
  failed: number;
}

interface PostsByStatus {
  drafts: Post[];
  ready: Post[];
  scheduled: Post[];
  published: Post[];
  failed: Post[];
}

interface SSEEvent {
  type: string;
  events?: GithubEvent[];
  event?: GithubEvent;
  stats?: PostsStats;
  postsByStatus?: PostsByStatus;
}

@Injectable()
export class GithubAppService {
  private cache = new Map<number, { token: string; expires: number }>();
  private queue: Queue<Record<string, unknown>>;
  private eventSubject = new Subject<GithubEvent>();
  private postsStatsSubject = new Subject<SSEEvent>();

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

  private getPrivateKey(): string {
    const privateKey = this.config.get<string>('GITHUB_APP_PRIVATE_KEY');
    if (privateKey) {
      return privateKey;
    }

    const privateKeyPath = this.config.get<string>(
      'GITHUB_APP_PRIVATE_KEY_PATH',
    );
    if (privateKeyPath) {
      try {
        const fullPath = path.resolve(privateKeyPath);
        return fs.readFileSync(fullPath, 'utf8');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(
          `Failed to read private key from path ${privateKeyPath}: ${errorMessage}`,
        );
      }
    }

    throw new Error(
      'Neither GITHUB_APP_PRIVATE_KEY nor GITHUB_APP_PRIVATE_KEY_PATH is configured',
    );
  }

  private generateJwt(): string {
    const privateKey = this.getPrivateKey();
    const appId = this.config.get<string>('GITHUB_APP_ID');
    if (!appId) {
      throw new Error('GITHUB_APP_ID not configured');
    }
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now,
      exp: now + 600,
      iss: appId,
    };
    return sign(payload, privateKey, { algorithm: 'RS256' });
  }

  async getInstallationToken(installationId: number): Promise<string> {
    const cacheKey = installationId;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.token;
    }

    const jwt = this.generateJwt();
    const octokit = new Octokit({
      auth: jwt,
    });

    const { data } = await octokit.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
    });

    this.cache.set(cacheKey, {
      token: data.token,
      expires:
        Date.now() +
        (data.expires_at
          ? new Date(data.expires_at).getTime() - Date.now() - 60000
          : 3600000),
    });

    return data.token;
  }

  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    const token = await this.getInstallationToken(installationId);
    return new Octokit({
      auth: token,
    });
  }

  async syncInstallationsFromGitHub(): Promise<Installation[]> {
    const jwt = this.generateJwt();
    const octokit = new Octokit({
      auth: jwt,
    });

    const { data } = await octokit.rest.apps.listInstallations();
    const installations: Installation[] = [];

    for (const installation of data) {
      const synced = await this.syncSingleInstallation({
        id: installation.id,
        account: installation.account
          ? {
              id: installation.account.id,
              login:
                'login' in installation.account
                  ? installation.account.login
                  : undefined,
              name:
                'name' in installation.account
                  ? installation.account.name
                  : undefined,
            }
          : null,
        created_at: installation.created_at,
      });
      if (synced) {
        installations.push(synced);
      }
    }

    return installations;
  }

  private async syncSingleInstallation(
    installation: GitHubInstallation,
  ): Promise<Installation | null> {
    try {
      const octokit = await this.getInstallationOctokit(installation.id);
      const { data: repos } =
        await octokit.rest.apps.listReposAccessibleToInstallation();

      const accountLogin = this.getAccountLogin(installation.account);

      const installationEntity = this.installations.create({
        id: installation.id,
        account_login: accountLogin,
        account_id: installation.account?.id || 0,
        repos: repos.repositories.map((repo) => repo.full_name),
        created_at: new Date(installation.created_at),
      });

      return await this.installations.save(installationEntity);
    } catch (error) {
      console.error(`Failed to sync installation ${installation.id}:`, error);
      return null;
    }
  }

  private getAccountLogin(account?: GitHubAccount | null): string {
    return (
      account?.login || account?.name || `account-${account?.id || 'unknown'}`
    );
  }

  async exchangeCodeForUserToken(code: string): Promise<string> {
    const clientId = this.config.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.config.get<string>('GITHUB_CLIENT_SECRET');

    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to exchange code for token: ${text}`);
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error('No access_token returned from GitHub');
    }
    return data.access_token;
  }

  async syncUserInstallationsFromGitHub(
    userToken: string,
  ): Promise<Installation[]> {
    const octokit = new Octokit({
      auth: userToken,
    });

    try {
      const { data } =
        await octokit.rest.apps.listInstallationsForAuthenticatedUser();

      const installations: Installation[] = [];

      for (const installation of data.installations) {
        const synced = await this.syncSingleInstallation({
          id: installation.id,
          account: installation.account
            ? {
                id: installation.account.id,
                login:
                  'login' in installation.account
                    ? installation.account.login
                    : undefined,
                name:
                  'name' in installation.account
                    ? installation.account.name
                    : undefined,
              }
            : null,
          created_at: installation.created_at,
        });
        if (synced) {
          installations.push(synced);
        } else {
          console.log(`❌ Failed to sync installation ${installation.id}`);
        }
      }

      return installations;
    } catch (error) {
      console.error('💥 Error in syncUserInstallationsFromGitHub:', error);
      throw error;
    }
  }

  async upsertInstallation(data: {
    installation_id: number;
    account_login: string;
    account_id: number;
    repositories: string[];
  }): Promise<void> {
    await this.installations.upsert(
      {
        id: data.installation_id,
        account_login: data.account_login,
        account_id: data.account_id,
        repos: data.repositories,
        created_at: new Date(),
      },
      ['id'],
    );
  }

  async removeInstallation(id: number): Promise<void> {
    await this.installations.delete({ id });
    this.cache.delete(id);
  }

  async updateRepos(id: number, repos: string[]): Promise<void> {
    await this.installations.update({ id }, { repos });
  }

  async getInstallationRepos(id: number): Promise<string[]> {
    const installation = await this.installations.findOne({
      where: { id },
    });
    return installation?.repos || [];
  }

  async getAllInstallations(): Promise<Installation[]> {
    return this.installations.find();
  }

  async getUserInstallations(githubId: string): Promise<Installation[]> {
    const accountId = parseInt(githubId, 10);

    const installations = await this.installations.find({
      where: { account_id: accountId },
    });

    return installations;
  }

  async getInstallationById(id: number): Promise<Installation | null> {
    return this.installations.findOne({
      where: { id },
    });
  }

  getInstallationUrl(): string {
    const appSlug = this.config.get<string>('GITHUB_APP_SLUG');
    return `https://github.com/apps/${appSlug}/installations/new`;
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

  getEventsStreamWithUpdates(): Observable<SSEEvent> {
    // Envoyer d'abord tous les événements existants
    const initialEvents = from(this.getRecentEvents(50)).pipe(
      map((events: GithubEvent[]) => {
        return {
          type: 'events',
          events,
        };
      }),
      catchError((error: unknown) => {
        console.error('❌ Error fetching initial events:', error);
        return of({
          type: 'events' as const,
          events: [] as GithubEvent[],
        });
      }),
    );

    // Puis écouter les nouveaux événements
    const newEvents = this.eventSubject.asObservable().pipe(
      map((event: GithubEvent) => {
        return {
          type: 'new-event',
          event,
        };
      }),
      catchError((error: unknown) => {
        console.error('❌ Error in new events stream:', error);
        return of({
          type: 'error' as const,
          message: 'Error in new events stream',
        });
      }),
    );

    // Mettre à jour périodiquement les événements existants
    const periodicUpdates = interval(30000).pipe(
      switchMap(() => {
        return from(this.getRecentEvents(50));
      }),
      map((events: GithubEvent[]) => {
        return {
          type: 'events-update',
          events,
        };
      }),
      catchError((error: unknown) => {
        console.error('❌ Error in periodic events update:', error);
        return of({
          type: 'events-update' as const,
          events: [] as GithubEvent[],
        });
      }),
    );

    return merge(initialEvents, newEvents, periodicUpdates).pipe(
      catchError((error: unknown) => {
        console.error('❌ Error in events stream merge:', error);
        return of({
          type: 'error' as const,
          message: 'Stream error',
        });
      }),
    );
  }

  getPostsStatsStream(): Observable<SSEEvent> {
    // Envoyer d'abord les stats initiales
    const initialStats = from(this.getPostsStats()).pipe(
      map((stats: PostsStats) => ({
        type: 'stats',
        stats,
      })),
    );

    const initialPostsByStatus = from(this.getPostsByStatus()).pipe(
      map((postsByStatus: PostsByStatus) => ({
        type: 'posts-by-status',
        postsByStatus,
      })),
    );

    // Mettre à jour périodiquement
    const periodicUpdates = interval(30000).pipe(
      switchMap(() => from(this.getPostsStats())),
      map((stats: PostsStats) => ({
        type: 'stats-update',
        stats,
      })),
    );

    const periodicPostsUpdates = interval(30000).pipe(
      switchMap(() => from(this.getPostsByStatus())),
      map((postsByStatus: PostsByStatus) => ({
        type: 'posts-update',
        postsByStatus,
      })),
    );

    return merge(
      initialStats,
      initialPostsByStatus,
      periodicUpdates,
      periodicPostsUpdates,
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

  async getCurrentMonthEvents(): Promise<GithubEvent[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.events.find({
      where: {
        received_at: MoreThanOrEqual(startOfMonth),
      },
      order: { received_at: 'DESC' },
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
    const eventType = this.mapEventToType(event);
    const repoFullName = this.extractRepoFullName(payload);

    // Récupérer l'installation
    const installation = await this.installations.findOne({
      where: { id: installationId },
    });

    if (!installation) {
      console.warn(`Installation ${installationId} not found`);
      return;
    }

    const eventEntity = this.events.create({
      delivery_id: delivery,
      installation,
      event: event,
      event_type: eventType,
      repo_full_name: repoFullName,
      payload: payload,
      status: 'pending',
    });

    await this.events.save(eventEntity);
    this.eventSubject.next(eventEntity);
  }

  private extractRepoFullName(payload: Record<string, unknown>): string {
    if (payload.repository && typeof payload.repository === 'object') {
      const repo = payload.repository as Record<string, unknown>;
      if (repo.full_name && typeof repo.full_name === 'string') {
        return repo.full_name;
      }
    }
    return 'unknown';
  }

  async savePost(data: {
    installationId: number;
    repo: string;
    eventType: string;
    content: string;
  }): Promise<void> {
    // Récupérer l'installation
    const installation = await this.installations.findOne({
      where: { id: data.installationId },
    });

    if (!installation) {
      console.warn(`Installation ${data.installationId} not found`);
      return;
    }

    const post = this.posts.create({
      installation,
      summary: data.content.substring(0, 100),
      postContent: data.content,
      rawResponse: { eventType: data.eventType, repo: data.repo },
      status: 'draft',
    });

    await this.posts.save(post);
  }

  async createTestEvent(): Promise<GithubEvent> {
    // Récupérer une installation existante ou en créer une
    let installation = await this.installations.findOne({
      where: { id: 1 },
    });

    if (!installation) {
      installation = this.installations.create({
        id: 1,
        account_login: 'test-user',
        account_id: 1,
        repos: ['test/repo'],
        created_at: new Date(),
      });
      await this.installations.save(installation);
    }

    const testEvent = this.events.create({
      delivery_id: `test-${Date.now()}`,
      installation,
      event: 'push',
      event_type: 'push',
      repo_full_name: 'test/repo',
      payload: { test: true },
      status: 'pending',
    });

    return await this.events.save(testEvent);
  }

  async forceSyncAllInstallations(): Promise<Installation[]> {
    return this.syncInstallationsFromGitHub();
  }

  async getPostsStats(): Promise<PostsStats> {
    const [drafts, ready, scheduled, published, failed] = await Promise.all([
      this.posts.count({ where: { status: 'draft' } }),
      this.posts.count({ where: { status: 'ready' } }),
      this.posts.count({ where: { status: 'scheduled' } }),
      this.posts.count({ where: { status: 'published' } }),
      this.posts.count({ where: { status: 'failed' } }),
    ]);

    return {
      drafts,
      ready,
      scheduled,
      published,
      failed,
    };
  }

  async getPostsByStatus(): Promise<PostsByStatus> {
    const [drafts, ready, scheduled, published, failed] = await Promise.all([
      this.posts.find({
        where: { status: 'draft' },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: 'ready' },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: 'scheduled' },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: 'published' },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: 'failed' },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
    ]);

    return {
      drafts,
      ready,
      scheduled,
      published,
      failed,
    };
  }
}
