export interface CacheDriver {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl: number): Promise<void>;
  exists(key: string): Promise<boolean>;

  connected?(): boolean;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}
