import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  // private readonly redisClient: Redis.Redis;
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    // this.redisClient = new Redis(process.env.REDIS_URI);
  }
  async get(key: string) {
    console.log(`get ${key} from Redis`);
    return await this.cache.get(key);
  }
  async set(key: string, value: any, ttl?: number) {
    const seconds = ttl || 5;
    console.log(`set ${key} from Redis`);
    await this.cache.set(key, value, seconds);
  }
  async del(key: string) {
    console.log(`get ${key} from Redis`);
    await this.cache.del(key);
  }
  // async getlength(key:string){
  //   return this.redisClient.g(listKey, values)
  // }
  // async lset(listKey: string, ...values: any): Promise<number> {
  //   return this.redisClient.lpush(listKey, values);
  // }
  // async lpush(listKey: string, ...values: any): Promise<number> {
  //   return this.redisClient.lpush(listKey, values);
  // }
  // async hlength(listKey: string): Promise<number> {
  //   return this.redisClient.hlen(listKey);
  // }
}
