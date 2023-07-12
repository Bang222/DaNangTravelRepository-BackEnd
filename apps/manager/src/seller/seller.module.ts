import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import {
  ConversationEntity,
  FriendRequestEntity,
  MessageEntity,
  PostgresdbModule,
  RedisModule,
  StoreEntity,
  StoreRepository,
  TourEntity,
  TourRepository,
  UserEntity,
} from '@app/shared';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerService } from './seller.service';

@Module({
  imports: [
    RedisModule,
    CacheModule.register(),
    PostgresdbModule,
    TypeOrmModule.forFeature([
      UserEntity,
      // FriendRequestEntity,
      // MessageEntity,
      // ConversationEntity,
      TourEntity,
      StoreEntity,
    ]),
  ],
  controllers: [],
  providers: [
    SellerService,
    {
      provide: 'StoreRepositoryInterface',
      useClass: StoreRepository,
    },
  ],
  exports: [SellerService],
})
export class SellerModule {}
