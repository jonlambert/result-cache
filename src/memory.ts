import { CacheDriver } from './base';

export class MemoryDriver implements CacheDriver {
  private map = new Map<string, { value: unknown; expires: number }>();

  async set<T>(key: string, value: T, ttl: number) {
    this.map.set(key, { value, expires: Date.now() + ttl });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.map.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  async exists(key: string): Promise<boolean> {
    return this.map.has(key);
  }
}
