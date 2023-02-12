import { CacheDriver } from './base';
import { MemoryCache } from './memory';
import { RedisCache } from './redis';

let cache: CacheDriver;

export const getCacheDriver = async () => {
  if (!cache) {
    console.log('[cache] instantiating cache...');

    try {
      const newCache = new RedisCache();
      await newCache.connect();
      console.log('[cache] redis connected');
      cache = newCache;
    } catch (e) {
      console.error(e);
      console.log('[cache] in-memory cache used');
      cache = new MemoryCache();
    }
  }

  return cache;
};
