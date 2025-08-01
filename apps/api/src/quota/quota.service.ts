import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_JWT_SECRET } from '../common/constants';
import { Redis } from 'ioredis';
import { Observable, interval } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class QuotaService {
  private redis: Redis;
  private readonly DAILY_LIMIT = 5;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
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

  getQuotaStream(token: string): Observable<any> {
    // Décoder le token pour obtenir l'userId
    const jwtSecret = this.config.get<string>('JWT_SECRET') || DEFAULT_JWT_SECRET;
    const decoded = this.jwtService.verify(token, { secret: jwtSecret });
    const userId = decoded.sub;

    if (!userId) {
      throw new ForbiddenException('Invalid token');
    }

    // Envoyer d'abord le quota initial
    const initialQuota = this.getUsage(userId).then(quota => ({
      type: 'quota',
      quota,
    }));

    // Mettre à jour périodiquement
    const periodicUpdates = interval(60000).pipe(
      switchMap(() => this.getUsage(userId)),
      map(quota => ({
        type: 'quota-update',
        quota,
      }))
    );

    return new Observable(subscriber => {
      // Envoyer le quota initial
      initialQuota.then(data => subscriber.next(data));

      // S'abonner aux mises à jour périodiques
      const subscription = periodicUpdates.subscribe(subscriber);

      // Cleanup
      return () => subscription.unsubscribe();
    });
  }
}
