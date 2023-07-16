import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt-strategy';
import { UseRoleGuard } from './guard/role.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import {
  SharedModule,
  PostgresdbModule,
  SharedService,
  UserEntity,
  FriendRequestRepository,
  UsersRepository,
  FriendRequestEntity,
  MessageEntity,
  ConversationEntity,
  EmailVerifiedService,
  TourEntity,
  StoreEntity,
  CartEntity,
  OrderEntity,
  OrderDetailEntity,
  UserRegisteredTourEntity,
  UsedTourReviewEntity,
} from '@app/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
    SharedModule,
    PostgresdbModule,
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      MessageEntity,
      ConversationEntity,
      TourEntity,
      StoreEntity,
      CartEntity,
      OrderEntity,
      OrderDetailEntity,
      UserRegisteredTourEntity,
      UsedTourReviewEntity,
    ]),
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
  ],
  controllers: [AuthController],
  providers: [
    JwtGuard,
    JwtStrategy,
    UseRoleGuard,
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
  ],
})
export class AuthModule {}
