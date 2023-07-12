import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import {
  ConversationEntity,
  EmailVerifiedService,
  FriendRequestEntity,
  FriendRequestRepository,
  MessageEntity,
  PostgresdbModule,
  RedisModule,
  SharedModule,
  SharedService,
  StoreRepository,
  TourRepository,
  UserEntity,
  UsersRepository,
} from '@app/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from '@app/shared/models/entities/tourist.entity';
import { AuthService } from '../../auth/src/auth.service';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtStrategy } from '../../auth/src/strategy/jwt-strategy';
import { UseRoleGuard } from '../../auth/src/guard/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TourModule } from './tour/tour.module';
import { TourService } from './tour/tour.service';
import { StoreEntity } from '@app/shared/models/entities/store.entity';
import {SellerService} from "./seller/seller.service";
import {SellerModule} from "./seller/seller.module";

@Module({
  imports: [
    SharedModule.registerRmq(
      'MANAGER_SERVICE',
      process.env.RABBITMQ_MANAGER_QUEUE,
    ),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),

    SharedModule,
    PostgresdbModule,
    TourModule,
    SellerModule,
    RedisModule,
    CacheModule.register(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
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
    ]),
  ],
  controllers: [ManagerController],
  providers: [
    ManagerService,
    JwtStrategy,
    TourService,
    SellerService,
    UseRoleGuard,
    {
      provide: 'TourRepositoryInterface',
      useClass: TourRepository,
    },
    {
      provide: 'EmailServiceInterface',
      useClass: EmailVerifiedService,
    },
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'FriendRequestRepositoryInterface',
      useClass: FriendRequestRepository,
    },
    {
      provide: 'StoreRepositoryInterface',
      useClass: StoreRepository,
    },
  ],
})
export class ManagerModule {}