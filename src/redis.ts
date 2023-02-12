import type { RedisClientType } from '@redis/client';

import { CacheDriver } from './base';

export class RedisCache implements CacheDriver {
  constructor(private readonly client: RedisClientType) {}

  async get(key: string): Promise<unknown> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : undefined;
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async exists(key: string) {
    return Boolean(await this.client.exists(key));
  }

  async connect() {
    return this.client.connect();
  }

  async disconnect() {
    return this.client.disconnect();
  }
}
