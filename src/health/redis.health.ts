import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

const HEALTH_KEY = 'health:ping';
const TTL_MS = 1000;

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicator: HealthIndicatorService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    const check = this.healthIndicator.check(key);
    try {
      await this.cache.set(HEALTH_KEY, 'pong', TTL_MS);
      const value = await this.cache.get<string>(HEALTH_KEY);
      if (value !== 'pong') {
        return check.down('redis ping check failed');
      }
      return check.up();
    } catch {
      return check.down('redis unreachable');
    }
  }
}
