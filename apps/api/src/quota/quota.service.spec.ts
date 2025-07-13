import { QuotaService } from './quota.service';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';

class MockRedis {
  private store = new Map<string, number>();
  async incr(key: string) {
    const val = (this.store.get(key) || 0) + 1;
    this.store.set(key, val);
    return val;
  }
  async expire(_key: string, _secs: number) {
    return 1;
  }
  async get(key: string) {
    const v = this.store.get(key);
    return v ? String(v) : null;
  }
  async flushall() {
    this.store.clear();
  }
}

describe('QuotaService', () => {
  let service: QuotaService;
  const redis = new MockRedis();

  beforeAll(() => {
    service = new QuotaService({ get: () => undefined } as any);
    (service as any).redis = redis;
  });

  beforeEach(async () => {
    await redis.flushall();
  });

  it('allows up to 5 calls', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(service.consume('u1')).resolves.toBeUndefined();
    }
    const usage = await service.getUsage('u1');
    expect(usage.used).toBe(5);
    expect(usage.remaining).toBe(0);
  });

  it('throws on 6th call', async () => {
    for (let i = 0; i < 5; i++) {
      await service.consume('u2');
    }
    await expect(service.consume('u2')).rejects.toBeDefined();
  });
});
