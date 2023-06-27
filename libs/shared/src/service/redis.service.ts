import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  async get(key: string) {
    console.log(`get ${key} from Redis`);
    return await this.cache.get(key);
  }
  async set(key: string, value: unknown) {
    console.log(`set ${key} from Redis`);
    await this.cache.set(key, value);
  }
  async del(key: string) {
    console.log(`get ${key} from Redis`);
    await this.cache.del(key);
  }
}
