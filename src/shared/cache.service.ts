import { Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService {
  private readonly stdTTL: number = 300; // default TTL in seconds
  private cache = new NodeCache({ stdTTL: this.stdTTL }); // cache for 5 minutes
  private readonly logger: Logger = new Logger(CacheService.name);

  get<T>(key: string): T | undefined {
    this.logger.debug(`Getting cache for key: ${key}`);
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.logger.debug(
      `Setting cache for key: ${key} for ${ttl ? ttl : this.stdTTL} seconds`,
    );
    this.cache.set(key, value, ttl);
  }

  clearByPrefix(prefix: string): void {
    const keys = this.cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.del(key);
      }
    });
  }

  clear(): void {
    this.cache.flushAll();
  }
}
