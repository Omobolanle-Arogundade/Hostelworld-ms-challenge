import { Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { CacheInterface } from './cache.interface';

@Injectable()
export class NodeCacheService implements CacheInterface {
  private readonly stdTTL = 300;
  private readonly logger = new Logger(NodeCacheService.name);
  private cache = new NodeCache({ stdTTL: this.stdTTL });

  get<T>(key: string): T | undefined {
    this.logger.debug(`Getting cache for key: ${key}`);
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.logger.debug(
      `Setting cache for key: ${key} for ${ttl ?? this.stdTTL} seconds`,
    );
    this.cache.set(key, value, ttl);
  }

  clearByPrefix(prefix: string): void {
    this.logger.debug(`Clearing keys with prefix: ${prefix}`);
    const keys = this.cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.del(key);
      }
    });
  }

  clear(): void {
    this.logger.debug('Flushing entire cache');
    this.cache.flushAll();
  }
}
