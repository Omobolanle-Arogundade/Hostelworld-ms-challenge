import { Module, Global } from '@nestjs/common';
import { NodeCacheService } from './node-cache.service';
import { RedisCacheService } from './redis-cache.service';

const getService = () => {
  const cacheType = process.env.CACHE_TYPE;
  if (cacheType === 'redis') {
    return RedisCacheService;
  }
  return NodeCacheService;
};

@Global()
@Module({
  providers: [
    {
      provide: 'CacheInterface',
      useClass: getService(),
    },
    NodeCacheService,
    RedisCacheService,
  ],
  exports: ['CacheInterface'],
})
export class CacheModule {}
