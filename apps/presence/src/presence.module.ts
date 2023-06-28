import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { RedisModule, SharedModule, SharedService } from '@app/shared';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: './.env',
    // }),
    SharedModule,
    RedisModule,
    CacheModule.register(),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [PresenceController],
  providers: [
    PresenceService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class PresenceModule {}
