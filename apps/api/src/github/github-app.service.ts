import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { Queue } from 'bullmq';
import { Observable, Subject } from 'rxjs';
import * as crypto from 'crypto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Installation } from './entities/installation.entity';
import { Event as GithubEvent } from './entities/event.entity';
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
    await this.installations.delete({ id: id });
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

  getEventStream(): Observable<GithubEvent> {
    return this.eventSubject.asObservable();
  }

  async getRecentEvents(limit = 20): Promise<GithubEvent[]> {
    return this.events.find({
      order: { received_at: 'DESC' },
      take: limit,
    });
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
    } catch {
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
      payload,
      repo_full_name: repoFullName,
      metadata,
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
        diffStats: {
          additions: 5,
          deletions: 0,
          total: 5,
        },
      },
    };

    const saved = await this.events.save(testEvent);
    this.eventSubject.next(saved);
    return saved;
  }
}
