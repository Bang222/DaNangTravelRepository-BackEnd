import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@app/shared';

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
