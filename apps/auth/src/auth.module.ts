import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  UsersRepository,
  TourEntity,
  StoreEntity,
  CartEntity,
  OrderEntity,
  OrderDetailEntity,
  UserRegisteredTourEntity,
  ShareExperienceEntity,
  CommentEntity,
  PaymentEntity,
  ScheduleEntity,
  PassengerEntity,
  KeyTokenEntity,
  KeyTokenRepository,
} from '@app/shared';
import { AuthUtilService } from './util/authUtil.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('MAIL_SERVICE', process.env.RABBITMQ_MAIL_QUEUE),
    SharedModule,
    PostgresdbModule,
    TypeOrmModule.forFeature([
      UserEntity,
      TourEntity,
      StoreEntity,
      CartEntity,
      OrderEntity,
      OrderDetailEntity,
      UserRegisteredTourEntity,
      ShareExperienceEntity,
      CommentEntity,
      PaymentEntity,
      ScheduleEntity,
      PassengerEntity,
      KeyTokenEntity,
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
    AuthUtilService,
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
      provide: 'KeyTokenRepositoryInterface',
      useClass: KeyTokenRepository,
    },
  ],
})
export class AuthModule {}
