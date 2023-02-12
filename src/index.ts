import { CacheDriver } from './base';
import { MemoryCache } from './memory';
import { AfterSerialization } from './types';

type Key = string | string[];

type CacheOptions = {
  /**
   * How long should results be cached for in seconds. Default: 30s.
   */
  ttl: number;

  /**
   * Skip the cache entirely.
   */
  enabled: boolean;

  /**
   * Prefixes every key with this value.
   *
   * Example:
   *
   * Given `{ prefix: 'foo' }`,
   * a `bar` key would yield `foo.bar`, and a `['hello', 'world']` key would yield `foo.hello.world`.
   *
   */
  prefix?: Key;

  driver: CacheDriver;
};

const defaultOptions = {
  ttl: 30e3,
  enabled: true,
  driver: new MemoryCache() as CacheDriver,
};

export const createCache = async (options?: Partial<CacheOptions>) => {
  const { driver, enabled, ttl } = { ...defaultOptions, ...options };

  // attempt to open the connection if appropriate to do so
  if (typeof driver.connect !== 'undefined' && !driver.connected?.()) {
    await driver.connect();
  }

  return {
    /**
     * Cache the result of the given promise-resolving function. If a value matching the given key is found in the cache.
     * @param fn
     * @param key
     * @returns Promise that resolves either a cached result of this function, or a fresh copy.
     */
    async cache<T>(fn: () => Promise<T>, key: Key): Promise<T> {
      // Skip the cache entirely if not enabled
      if (!enabled) {
        return await fn() as any;
      }

      const keyCopy = Array.isArray(key) ? key.join('.') : key;
      const cached = await driver.get(keyCopy);

      if (cached) {
        console.log(`[cache] [${keyCopy}] hit`);
        // unsure whether we should add validation here. probably out of scope for now.
        // should we just encourage the consumer to validate? or should we add protection by encouraging the supplying of validation?
        return cached as T;
      }

      console.log(`[cache] [${keyCopy}] miss`);

      // Evaluate fn
      const result = await fn();

      // Cache result
      await driver.set(keyCopy, result, ttl);

      console.log(`[cache] [${keyCopy}] updated`);

      return result as T;
    },
    async purge() {
      throw new Error('coming soon');
    },
  };
};


type Cache = Awaited<ReturnType<typeof createCache>>;
let defaultCache: Cache | undefined;

export const getDefaultCache = async () => {
  if (!defaultCache) {
    defaultCache = await createCache();
  }
  return defaultCache;
}
