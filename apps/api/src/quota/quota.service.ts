import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class QuotaService {
  private redis: Redis;
  private readonly DAILY_LIMIT = 5;

  constructor(private readonly config: ConfigService) {
    const url =
      this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(url);
  }

  private getKey(userId: string): string {
    const today = new Date().toISOString().slice(0, 10);
    return `quota:${userId}:${today}`;
  }

  async consume(userId: string): Promise<void> {
    const key = this.getKey(userId);
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 24 * 60 * 60);
    }
    if (count > this.DAILY_LIMIT) {
      throw new ForbiddenException('Daily quota exceeded');
    }
  }

  async getUsage(userId: string): Promise<{ used: number; remaining: number }> {
    const key = this.getKey(userId);
    const count = parseInt((await this.redis.get(key)) || '0', 10);
    return { used: count, remaining: Math.max(0, this.DAILY_LIMIT - count) };
  }
}
