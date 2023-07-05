import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtService } from '@nestjs/jwt';
import { EmailServiceInterface } from '@app/shared/interfaces/email.interface';

@Injectable()
export class EmailVerifiedService implements EmailServiceInterface {
  constructor(
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {
    new HandlebarsAdapter(undefined, {
      inlineCssEnabled: true,
      inlineCssOptions: {
        url: ' ',
        preserveMediaQueries: true,
      },
    });
  }
  async sendEmailVerify(email: string) {
    const token = this.jwtService.signAsync({ email });
    const url = `http://localhost:4000/api/email-verify?token=${token}`;
    return this.mailerService.sendMail({
      to: email,
      from: 'bangdpcgcd191292@fpt.edu.vn',
      subject: 'Welcome to DA NANG Travel',
      text: 'Welcome',
      html: `<b>Welcome to DA NANG Travel</b></br><p>Hi ${email}, Let's confirm your email address.</p></br><a href="${url}">Cofirm Email Address</a>`,
    });
  }
}
