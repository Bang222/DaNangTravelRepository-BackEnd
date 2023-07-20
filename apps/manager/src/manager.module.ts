import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';

import { ManagerController } from './manager.controller';

import { SellerService } from './seller/seller.service';
import { TourService } from './tour/tour.service';
import { ManagerService } from './manager.service';

import { CacheModule } from '@nestjs/cache-manager';

import {
  CartEntity,
  CartRepository,
  CommentEntity,
  CommentRepository,
  ConversationEntity,
  FriendRequestEntity,
  MessageEntity,
  OrderDetailEntity,
  OrderDetailRepository,
  OrderEntity,
  OrderRepository,
  PostgresdbModule,
  RedisModule,
  SharedModule,
  SharedService,
  StoreEntity,
  StoreRepository,
  TourEntity,
  TourRepository,
  ShareExperienceEntity,
  ShareExperience,
  UserEntity,
  UserRegisteredTourEntity,
  UserRegisteredTour,
  UsersRepository,
} from '@app/shared';

@Module({
  imports: [
    SharedModule.registerRmq(
      'MANAGER_SERVICE',
      process.env.RABBITMQ_MANAGER_QUEUE,
    ),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),

    SharedModule,
    PostgresdbModule,
    RedisModule,
    CacheModule.register(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get<string>('MAIL_TRANSPORT'),
        defaults: {
          from: `No Reply ${configService.get<string>('MAIL_USER')}`,
        },
        template: {
          dir: __dirname + '/templates/email',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      MessageEntity,
      ConversationEntity,
      TourEntity,
      StoreEntity,
      OrderEntity,
      CartEntity,
      UserRegisteredTourEntity,
      OrderDetailEntity,
      ShareExperienceEntity,
      CommentEntity,
    ]),
  ],
  controllers: [ManagerController],
  providers: [
    ManagerService,
    TourService,
    SellerService,
    {
      provide: 'TourRepositoryInterface',
      useClass: TourRepository,
    },
    // {
    //   provide: 'EmailServiceInterface',
    //   useClass: EmailVerifiedService,
    // },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'StoreRepositoryInterface',
      useClass: StoreRepository,
    },
    {
      provide: 'CartRepositoryInterface',
      useClass: CartRepository,
    },
    {
      provide: 'UserRegisteredTourRepositoryInterface',
      useClass: UserRegisteredTour,
    },
    {
      provide: 'OrderDetailRepositoryInterface',
      useClass: OrderDetailRepository,
    },
    {
      provide: 'OrderRepositoryInterface',
      useClass: OrderRepository,
    },
    {
      provide: 'ShareExperienceRepositoryInterface',
      useClass: ShareExperience,
    },
    {
      provide: 'CommentRepositoryInterface',
      useClass: CommentRepository,
    },
  ],
})
export class ManagerModule {}
