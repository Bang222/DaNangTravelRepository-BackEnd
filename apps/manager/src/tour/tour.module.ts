import { Module } from '@nestjs/common';
import {
  PostgresdbModule,
  RedisModule,
  TourEntity,
  TourRepository,
  UserEntity,
} from '@app/shared';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourService } from './tour.service';

@Module({
  imports: [
    RedisModule,
    CacheModule.register(),
    PostgresdbModule,
    TypeOrmModule.forFeature([UserEntity, TourEntity]),
  ],
  controllers: [],
  providers: [
    TourService,
    {
      provide: 'TourRepositoryInterface',
      useClass: TourRepository,
    },
  ],
  exports: [TourService],
})
export class TourModule {}
