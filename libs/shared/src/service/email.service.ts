// import { Inject, Injectable } from '@nestjs/common';
// import { UsersRepositoryInterface } from '@app/shared';
// import { MailerService } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { JwtService } from '@nestjs/jwt';
// import { ClientProxy } from '@nestjs/microservices';
// import { AuthService } from '../../../../apps/auth/src/auth.service';
//
// @Injectable()
// export class EmailService {
//   constructor(
//     private jwtService: JwtService,
//     private mailerService: MailerService,
//     @Inject('UsersRepositoryInterface')
//     private readonly usersRepository: UsersRepositoryInterface,
//     @Inject('AuthServiceInterface') private authService: AuthService,
//   ) {
//     new HandlebarsAdapter(undefined, {
//       inlineCssEnabled: true,
//       inlineCssOptions: {
//         url: ' ',
//         preserveMediaQueries: true,
//       },
//     });
//   }
//   async sendEmailVerify(email: string) {
//     const token = this.jwtService.signAsync({ email });
//     const url = `http://localhost:4000/api/auth?token=${token}`;
//     return this.mailerService
//       .sendMail({
//         to: email,
//         from: 'bangdpcgcd191292@fpt.edu.vn',
//         subject: 'Welcome to DA NANG Travel',
//         text: 'Welcome',
//         html: `<b>Welcome to DA NANG Travel</b></br><p>Hi ${email}, Let's confirm your email address.</p></br><a href="${url}">Cofirm Email Address</a>`,
//       })
//       .then(() => {})
//       .catch(() => {});
//   }
// }
