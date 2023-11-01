import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard, SharedModule } from '@app/shared';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CloudinaryService } from '../../third-party-service/src/cloudinary/cloudinary.service';
import { CloudinaryProvider } from '../../third-party-service/src/cloudinary/cloudinary.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'MANAGER_SERVICE',
      process.env.RABBITMQ_MANAGER_QUEUE,
    ),
    SharedModule.registerRmq('TOUR_SERVICE', process.env.RABBITMQ_TOUR_QUEUE),

    SharedModule.registerRmq('MAIL_SERVICE', process.env.RABBITMQ_MAIL_QUEUE),
    SharedModule.registerRmq('SHARE_SERVICE', process.env.RABBITMQ_SHARE_QUEUE),
    SharedModule.registerRmq(
      'PAYMENT_SERVICE',
      process.env.RABBITMQ_PAYMENT_QUEUE,
    ),
    ThrottlerModule.forRoot({
      ttl: 60, // seconds
      limit: 100, // requests per TTL period
    }),
  ],
  controllers: [AppController],
  providers: [
    CloudinaryService,
    CloudinaryProvider,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
