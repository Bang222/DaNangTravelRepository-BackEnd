// import { Module } from '@nestjs/common';
// import { EmailService } from '@app/shared/service/email.service';
// import {PostgresdbModule, SharedModule, UserEntity, UsersRepository} from '@app/shared';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MailerModule } from '@nestjs-modules/mailer';
// import {AuthService} from "../../../../apps/auth/src/auth.service";
//
// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     // MailerModule.forRootAsync({
//     //   imports: [ConfigModule],
//     //   useFactory: async (configService: ConfigService) => ({
//     //     transport: configService.get<string>('MAIL_TRANSPORT'),
//     //     defaults: {
//     //       from: `No Reply ${configService.get<string>('MAIL_USER')}`,
//     //     },
//     //     template: {
//     //       dir: __dirname + '/templates/email',
//     //       adapter: new HandlebarsAdapter(),
//     //       options: {
//     //         strict: true,
//     //       },
//     //     },
//     //   }),
//     //   inject:[ConfigService]
//     // }),
//     PostgresdbModule,
//     TypeOrmModule.forFeature([UserEntity]),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_VERIFY_MAIL'),
//         signOptions: { expiresIn: '3600s' },
//       }),
//       inject: [ConfigService],
//     }),
//     SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
//   ],
//   controllers: [],
//   providers: [
//     EmailService,
//     {
//       provide: 'UsersRepositoryInterface',
//       useClass: UsersRepository,
//     },
//     {
//       provide: 'AuthServiceInterface',
//       useClass: AuthService,
//     },
//   ],
//   exports: [EmailService],
// })
// export class EmailVerifyModule {}
