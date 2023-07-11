import { Module } from '@nestjs/common';
import { EmailVerifiedService, PostgresdbModule } from '@app/shared';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    PostgresdbModule,
    // TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_VERIFY_MAIL'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [EmailVerifiedService],
  exports: [
    EmailVerifiedService,
    // {
    //   provide: MAILER_OPTIONS,
    //   useValue: process.env.MAIL_TRANSPORT,
    // },
  ],
})
export class EmailVerifiedModule {}
