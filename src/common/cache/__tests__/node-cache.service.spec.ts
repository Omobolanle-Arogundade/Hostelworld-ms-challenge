import { NodeCacheService } from '../node-cache.service';

describe('NodeCacheService', () => {
  let cacheService: NodeCacheService;

  beforeEach(() => {
    cacheService = new NodeCacheService();
    cacheService.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a value by key', () => {
      cacheService.set('user:1', { name: 'John' });
      const result = cacheService.get<{ name: string }>('user:1');
      expect(result).toEqual({ name: 'John' });
    });

    it('should return undefined for a missing key', () => {
      const result = cacheService.get('nonexistent:key');
      expect(result).toBeUndefined();
    });
  });

  describe('clearByPrefix', () => {
    it('should delete keys that match a given prefix', () => {
      cacheService.set('records::1', { id: 1 });
      cacheService.set('records::2', { id: 2 });
      cacheService.set('other::3', { id: 3 });

      cacheService.clearByPrefix('records::');

      expect(cacheService.get('records::1')).toBeUndefined();
      expect(cacheService.get('records::2')).toBeUndefined();
      expect(cacheService.get('other::3')).toEqual({ id: 3 });
    });

    it('should do nothing if no key matches the prefix', () => {
      cacheService.set('foo::1', { id: 1 });
      cacheService.clearByPrefix('no-match::');
      expect(cacheService.get('foo::1')).toEqual({ id: 1 });
    });
  });

  describe('clear', () => {
    it('should flush the entire cache', () => {
      cacheService.set('a', 1);
      cacheService.set('b', 2);
      cacheService.clear();
      expect(cacheService.get('a')).toBeUndefined();
      expect(cacheService.get('b')).toBeUndefined();
    });
  });
});
