import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { Repository, MoreThanOrEqual, DataSource } from 'typeorm';
import { Installation } from './entities/installation.entity';
import { Event as GithubEvent, EventType } from './entities/event.entity';
import { Post } from './entities/post.entity';
import { PostRate, PostStatus } from 'src/common/dto/posts.enum';

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

  constructor(
    private config: ConfigService,
    @InjectRepository(Installation)
    private installations: Repository<Installation>,
    @InjectRepository(GithubEvent)
    private events: Repository<GithubEvent>,
    @InjectRepository(Post)
    private posts: Repository<Post>,
    private dataSource: DataSource,
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
    await this.dataSource.transaction(async (manager) => {
      // D'abord supprimer tous les événements liés à cette installation
      await manager
        .createQueryBuilder()
        .delete()
        .from('events')
        .where('installation_id = :id', { id })
        .execute();

      // Ensuite supprimer tous les posts liés à cette installation
      await manager
        .createQueryBuilder()
        .delete()
        .from('posts')
        .where('installation_id = :id', { id })
        .execute();

      // Finalement supprimer l'installation
      await manager.delete('installations', { id });
    });

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

  async getRepositoryDetails(
    installationId: number,
    owner: string,
    repo: string,
  ): Promise<any> {
    try {
      const octokit = await this.getInstallationOctokit(installationId);
      // Récupérer les détails du repository
      const { data: repository } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      // Récupérer les languages du repository
      const { data: languages } = await octokit.rest.repos.listLanguages({
        owner,
        repo,
      });

      // Récupérer les contributeurs
      const { data: contributors } = await octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 10,
      });

      // Récupérer les derniers commits
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 10,
      });

      // Récupérer les releases
      const { data: releases } = await octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: 5,
      });

      // Récupérer les issues ouvertes
      const { data: issues } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 10,
      });

      // Récupérer les pull requests ouvertes
      const { data: pullRequests } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 10,
      });

      // Récupérer les branches
      const { data: branches } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 10,
      });

      return {
        repository: {
          id: repository.id,
          name: repository.name,
          full_name: repository.full_name,
          description: repository.description,
          private: repository.private,
          html_url: repository.html_url,
          clone_url: repository.clone_url,
          ssh_url: repository.ssh_url,
          language: repository.language,
          stargazers_count: repository.stargazers_count,
          forks_count: repository.forks_count,
          open_issues_count: repository.open_issues_count,
          watchers_count: repository.watchers_count,
          size: repository.size,
          default_branch: repository.default_branch,
          created_at: repository.created_at,
          updated_at: repository.updated_at,
          pushed_at: repository.pushed_at,
          topics: repository.topics,
          license: repository.license,
          owner: {
            login: repository.owner.login,
            avatar_url: repository.owner.avatar_url,
            html_url: repository.owner.html_url,
          },
        },
        languages,
        contributors: contributors.map((contributor) => ({
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        })),
        recentCommits: commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author,
          date: commit.commit.author?.date,
          html_url: commit.html_url,
        })),
        releases: releases.map((release) => ({
          id: release.id,
          tag_name: release.tag_name,
          name: release.name,
          body: release.body,
          published_at: release.published_at,
          html_url: release.html_url,
        })),
        openIssues: issues.map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          state: issue.state,
          created_at: issue.created_at,
          html_url: issue.html_url,
          user: {
            login: issue.user?.login,
            avatar_url: issue.user?.avatar_url,
          },
        })),
        openPullRequests: pullRequests.map((pr) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          created_at: pr.created_at,
          html_url: pr.html_url,
          user: {
            login: pr.user?.login,
            avatar_url: pr.user?.avatar_url,
          },
        })),
        branches: branches.map((branch) => ({
          name: branch.name,
          commit: {
            sha: branch.commit.sha,
          },
          protected: branch.protected,
        })),
      };
    } catch (error) {
      console.error(
        `Failed to get repository details for ${owner}/${repo}:`,
        error,
      );
      throw new Error(
        `Failed to get repository details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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

  async getCurrentMonthPosts(): Promise<Post[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return this.posts.find({
      where: {
        createdAt: MoreThanOrEqual(startOfMonth),
      },
      order: { createdAt: 'DESC' },
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
      status: PostStatus.DRAFT,
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
      this.posts.count({ where: { status: PostStatus.DRAFT } }),
      this.posts.count({ where: { status: PostStatus.READY } }),
      this.posts.count({ where: { status: PostStatus.SCHEDULED } }),
      this.posts.count({ where: { status: PostStatus.PUBLISHED } }),
      this.posts.count({ where: { status: PostStatus.FAILED } }),
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
        where: { status: PostStatus.DRAFT },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: PostStatus.READY },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: PostStatus.SCHEDULED },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: PostStatus.PUBLISHED },
        order: { createdAt: 'DESC' },
        take: 100,
        relations: ['installation'],
      }),
      this.posts.find({
        where: { status: PostStatus.FAILED },
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

  async addPostFeedback(
    postId: number,
    feedback: { comment?: string; rate?: PostRate },
  ): Promise<void> {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    // Validation supplémentaire
    if (feedback.comment && feedback.comment.trim().length === 0) {
      feedback.comment = undefined;
    }

    // Ne mettre à jour que les champs fournis (éviter d'écraser avec undefined)
    if (feedback.rate !== undefined) {
      post.feedbackRate = feedback.rate;
    }
    if (feedback.comment !== undefined) {
      post.feedbackComment = feedback.comment;
    }

    post.updatedAt = new Date();
    await this.posts.save(post);
  }
}
