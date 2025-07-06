import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { Queue } from 'bullmq';
import crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class GithubAppService {
  private cache = new Map<number, { token: string; expires: number }>();
  private queue: Queue<Record<string, unknown>>;

  constructor(private config: ConfigService) {
    this.queue = new Queue<Record<string, unknown>>('github-events', {
      connection: {
        url: this.config.get<string>('REDIS_URL'),
      },
    });
  }

  verifySignature(req: Request): void {
    const secret = this.config.get<string>('GITHUB_WEBHOOK_SECRET')!;
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
}
