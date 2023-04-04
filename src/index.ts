import { CacheDriver } from './base';
import { getLogger } from './logging';
import { MemoryDriver } from './memory';

if (typeof global.window !== 'undefined') {
  throw new Error(
    'global.window is defined. This package is not designed to be bundled in the browser.'
  );
}

type Key = string | string[];

type IndividualCacheOptions = {
  /**
   * How long should results be cached for in seconds. Default: 30s.
   */
  ttl: number;

  /**
   * Skip the cache entirely.
   */
  enabled: boolean;
};

type CacheOptions = IndividualCacheOptions & {
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

  verbose?: boolean;

  driver: CacheDriver;

  /**
   * This event is fired after the cache has been hit. Use this to hook into metrics.
   */
  onCacheHit?: (key: string) => void;

  /**
   * This event is fired when the cache has been missed and we need to
   * re-execute the query. Use this to hook into metrics.
   */
  onCacheMiss?: (key: string) => void;
};

const formatKey = (key: Key) => (Array.isArray(key) ? key.join('.') : key);

const defaultOptions = {
  ttl: 30,
  enabled: true,
  driver: new MemoryDriver() as CacheDriver,
  verbose: false,
};

export const createCache = async (setup?: Partial<CacheOptions>) => {
  const optionsWithDefaults = { ...defaultOptions, ...setup };
  const { driver, verbose, onCacheHit, onCacheMiss } = optionsWithDefaults;
  const { debug } = getLogger(verbose);

  // attempt to open the connection if appropriate to do so
  if (typeof driver.connect !== 'undefined' && !driver.connected?.()) {
    debug(
      'driver can be connected to, with client in a disconnected state. connecting...'
    );
    await driver.connect();
  }

  return {
    /**
     * Cache the result of the given promise-resolving function. If a value matching the given key is found in the cache.
     * @param fn
     * @param key
     * @returns Promise that resolves either a cached result of this function, or a fresh copy.
     */
    async cache<T>(
      fn: () => Promise<T>,
      key: Key,
      options?: IndividualCacheOptions
    ): Promise<T> {
      const { enabled, ttl } = { ...optionsWithDefaults, ...options };
      // Skip the cache entirely if disabled
      if (!enabled) {
        return (await fn()) as any;
      }

      const keyCopy = formatKey(key);

      try {
        const cached = await driver.get(keyCopy);

        if (cached) {
          debug(`[${keyCopy}] hit`);
          onCacheHit?.(keyCopy);
          // unsure whether we should add validation here. probably out of scope for now.
          // should we just encourage the consumer to validate? or should we add protection by encouraging the supplying of validation?
          return cached as T;
        }
      } catch (e) {
        if (e instanceof Error) {
          debug(`[${keyCopy}] error - ${e.message}`);
        }
        return await fn();
      }

      debug(`[${keyCopy}] miss`);
      onCacheMiss?.(keyCopy);

      // Evaluate fn
      const result = await fn();

      // Cache result
      await driver.set(keyCopy, result, ttl);

      debug(`[${keyCopy}] updated`);

      return result as T;
    },
    async purge() {
      throw new Error('coming soon');
    },
  };
};

export type Cache = Awaited<ReturnType<typeof createCache>>;
let defaultCache: Cache | undefined;

export const getDefaultCache = async () => {
  if (!defaultCache) {
    defaultCache = await createCache();
  }
  return defaultCache;
};

export { MemoryDriver };
