import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type { CacheDriver } from './base';

export class DynamoDBCacheDriver implements CacheDriver {
  private tableName: string;
  private dynamoDB: DynamoDBClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.dynamoDB = new DynamoDBClient();
  }

  async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
    const expirationTime = Math.floor(Date.now() / 1000) + ttl;

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        key,
        value: JSON.stringify(value),
        ttl: expirationTime,
      }),
    });

    await this.dynamoDB.send(command);
  }

  async get(key: string): Promise<unknown | null> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ key }),
    });

    const result = await this.dynamoDB.send(command);

    if (result.Item) {
      const item = unmarshall(result.Item);
      const now = Math.floor(Date.now() / 1000);

      // Check if the item has expired
      if (item.ttl && item.ttl <= now) {
        // Item has expired, delete it and return null
        await this.delete(key);
        return null;
      }

      return JSON.parse(item.value);
    }

    return null;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall({ key }),
    });

    await this.dynamoDB.send(command);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.get(key);
    return Boolean(result);
  }
}
