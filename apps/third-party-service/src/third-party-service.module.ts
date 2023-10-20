import { Module } from '@nestjs/common';
import { SendMailController } from './send-mail/send-mail.controller';
import {
  CartEntity,
  CommentEntity,
  KeyTokenEntity,
  KeyTokenRepository,
  OrderDetailEntity,
  OrderEntity,
  PassengerEntity,
  PaymentEntity,
  PostgresdbModule,
  RedisModule,
  ScheduleEntity,
  SharedModule,
  SharedService,
  ShareExperienceEntity,
  StoreEntity,
  TourEntity,
  UserEntity,
  UsersRepository,
} from '@app/shared';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShardToSocialController } from './shard-to-social/shard-to-social.controller';
import { ShardToSocialService } from './shard-to-social/shard-to-social.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../../auth/src/auth.service';
import { AuthUtilService } from '../../auth/src/util/authUtil.service';
import { CloudinaryController } from './cloudinary/cloudinary.controller';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { SendMailService } from './send-mail/send-mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    // SharedModule.registerRmq(
    //   'AUTH_SERVICE',
    //   process.env.RABBITMQ_MANAGER_QUEUE,
    // ),
    SharedModule.registerRmq('MAIL_SERVICE', process.env.RABBITMQ_MAIL_QUEUE),
    SharedModule.registerRmq('SHARE_SERVICE', process.env.RABBITMQ_SHARE_QUEUE),
    SharedModule.registerRmq(
      'PAYMENT_SERVICE',
      process.env.RABBITMQ_PAYMENT_QUEUE,
    ),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '365d' },
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
    ScheduleModule.forRoot(),
    SharedModule,
    PostgresdbModule,
    RedisModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([
      UserEntity,
      TourEntity,
      StoreEntity,
      OrderEntity,
      CartEntity,
      OrderDetailEntity,
      ShareExperienceEntity,
      CommentEntity,
      PaymentEntity,
      ScheduleEntity,
      PassengerEntity,
      KeyTokenEntity,
    ]),
  ],
  controllers: [
    SendMailController,
    ShardToSocialController,
    CloudinaryController,
  ],
  providers: [
    ShardToSocialService,
    AuthUtilService,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SendMailServiceInterface',
      useClass: SendMailService,
    },
    {
      provide: 'KeyTokenRepositoryInterface',
      useClass: KeyTokenRepository,
    },
    CloudinaryService,
    CloudinaryProvider,
  ],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class ThirdPartyServiceModule {}
