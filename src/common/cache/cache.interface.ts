export interface CacheInterface {
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  set<T>(key: string, value: T, ttl?: number): Promise<void> | void;
  clearByPrefix(prefix: string): Promise<void> | void;
  clear(): Promise<void> | void;
}
