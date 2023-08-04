import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-redis-yet';
import { RedisCacheService } from '@app/shared/service/redis.service';
import { CacheModule } from '@nestjs/cache-manager';
const _Secconds = 5000;

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URI,
          ttl: _Secconds, //5s
        }),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),

  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisModule {}
