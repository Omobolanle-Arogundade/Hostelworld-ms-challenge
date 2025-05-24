import * as NodeCache from 'node-cache';
import { CacheService } from './cache.service';
import { Logger } from '@nestjs/common';

jest.mock('node-cache');

describe('CacheService', () => {
  let cacheService: CacheService;
  let nodeCacheInstance: jest.Mocked<NodeCache>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    nodeCacheInstance = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      flushAll: jest.fn(),
    } as any;

    (NodeCache as unknown as jest.Mock).mockImplementation(
      () => nodeCacheInstance,
    );

    cacheService = new CacheService();

    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value when key exists', () => {
      nodeCacheInstance.get.mockReturnValueOnce('test-value');

      const result = cacheService.get<string>('test-key');

      expect(result).toBe('test-value');
      expect(nodeCacheInstance.get).toHaveBeenCalledWith('test-key');
      expect(loggerSpy).toHaveBeenCalledWith('Getting cache for key: test-key');
    });

    it('should return undefined when key does not exist', () => {
      nodeCacheInstance.get.mockReturnValueOnce(undefined);

      const result = cacheService.get('missing-key');

      expect(result).toBeUndefined();
      expect(nodeCacheInstance.get).toHaveBeenCalledWith('missing-key');
    });
  });

  describe('set', () => {
    it('should set value with default TTL', () => {
      cacheService.set('key', 'value');

      expect(nodeCacheInstance.set).toHaveBeenCalledWith(
        'key',
        'value',
        undefined,
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Setting cache for key: key for 300 seconds`,
      );
    });

    it('should set value with custom TTL', () => {
      cacheService.set('custom-key', 123, 60);

      expect(nodeCacheInstance.set).toHaveBeenCalledWith('custom-key', 123, 60);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Setting cache for key: custom-key for 60 seconds`,
      );
    });
  });

  describe('clearByPrefix', () => {
    it('should delete keys matching the prefix', () => {
      nodeCacheInstance.keys.mockReturnValue([
        'record:1',
        'record:2',
        'mbid:1',
      ]);

      cacheService.clearByPrefix('record:');

      expect(nodeCacheInstance.del).toHaveBeenCalledWith('record:1');
      expect(nodeCacheInstance.del).toHaveBeenCalledWith('record:2');
      expect(nodeCacheInstance.del).not.toHaveBeenCalledWith('mbid:1');
    });

    it('should not call del if no keys match', () => {
      nodeCacheInstance.keys.mockReturnValue(['record:1', 'record:2']);

      cacheService.clearByPrefix('random:');

      expect(nodeCacheInstance.del).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should flush all cache', () => {
      cacheService.clear();

      expect(nodeCacheInstance.flushAll).toHaveBeenCalled();
    });
  });
});
