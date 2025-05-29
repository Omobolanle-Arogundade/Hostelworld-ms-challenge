import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheInterface } from './cache.interface';
import { AppConfig } from '../../app.config';

@Injectable()
export class RedisCacheService implements CacheInterface {
  private readonly client = new Redis({
    host: AppConfig.redis.host,
    port: AppConfig.redis.port,
  });

  private readonly logger = new Logger(RedisCacheService.name);

  async get<T>(key: string): Promise<T | undefined> {
    this.logger.debug(`Getting cache for key: ${key}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : undefined;
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    this.logger.debug(`Setting cache for key: ${key}`);
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async clearByPrefix(prefix: string): Promise<void> {
    this.logger.debug(`Clearing keys with prefix: ${prefix}`);
    const keys = await this.client.keys(`${prefix}*`);
    if (keys.length) await this.client.del(...keys);
  }

  async clear(): Promise<void> {
    this.logger.debug('Flushing all Redis keys');
    await this.client.flushall();
  }
}
