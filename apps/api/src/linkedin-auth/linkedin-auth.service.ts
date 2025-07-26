import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class LinkedinAuthService {
  private redis: Redis;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(url);
  }

  async storeToken(userId: string, token: string, expiresIn: number) {
    await this.redis.set(`linkedin:token:${userId}`, token, 'EX', expiresIn);
  }

  async getToken(userId: string): Promise<string | null> {
    return this.redis.get(`linkedin:token:${userId}`);
  }
}
