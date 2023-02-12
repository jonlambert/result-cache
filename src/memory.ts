import { CacheDriver } from './base';

export class MemoryCache implements CacheDriver {
  private _cache = new Map<string, unknown>();

  async get(key: string) {
    return this._cache.get(key) as any;
  }
  async set<T>(key: string, value: T) {
    this._cache.set(key, value);
  }
  async exists(key: string): Promise<boolean> {
    return this._cache.has(key);
  }
}
