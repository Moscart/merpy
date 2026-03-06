import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: Redis | null;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number
  ): Promise<'OK' | null> {
    if (!this.redis) return null;
    if (ttlSeconds) {
      return await this.redis.set(key, value, 'EX', ttlSeconds);
    }
    return await this.redis.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    return await this.redis.get(key);
  }

  async delete(key: string): Promise<number> {
    if (!this.redis) return 0;
    return await this.redis.del(key);
  }

  async deleteKeysByPattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;

    let cursor = '0';
    let deletedKeysCount = 0;

    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );

      cursor = newCursor;

      if (keys.length > 0) {
        await this.redis.del(...keys);
        deletedKeysCount += keys.length;
      }
    } while (cursor !== '0');

    console.log(
      `Berhasil menghapus ${deletedKeysCount} key dengan pattern ${pattern}`
    );
    return deletedKeysCount;
  }
}
