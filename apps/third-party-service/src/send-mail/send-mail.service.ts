import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface } from '../../../auth/src/interface/auth.service.interface';
import { SendMailServiceInterface } from '../interface/email/send-mail.service.interface';
import {
  KeyTokenRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import { configDataSendMail } from './dto';

@Injectable()
export class SendMailService implements SendMailServiceInterface {
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  constructor(
    private jwtService: JwtService,
    private mailerService: MailerService,
    @Inject('AuthServiceInterface')
    private readonly authServiceInterface: AuthServiceInterface,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('KeyTokenRepositoryInterface')
    private readonly keyTokenRepository: KeyTokenRepositoryInterface,
  ) {
    new HandlebarsAdapter(undefined, {
      inlineCssEnabled: true,
      inlineCssOptions: {
        url: ' ',
        preserveMediaQueries: true,
      },
    });
  }
  async sendEmailToToken(email: string) {
    const findUser = await this.usersRepository.findByCondition({
      where: { email },
    });
    if (!findUser) return 'can not found User';
    const token = await this.authService
      .send({ cmd: 'sign-token' }, { userId: findUser.id })
      .toPromise();
    if (!token) return 'can not found Token';
    const url = `${process.env.URL_EMAIL}validate-email?token=${token.access}`;
    return await this.mailerService.sendMail({
      to: email,
      from: 'bangdpcgcd191292@fpt.edu.vn',
      subject: 'DaNang Travel',
      text: 'Welcome',
      html: `<b>Welcome to DA NANG Travel</b></br><p>Hi ${email}, Let's confirm your email address.</p></br><a href="${url}">Cofirm Your Email Address</a>`,
    });
  }
  async sendEmailBooking(data: configDataSendMail) {
    const price = data.data.TotalPrice.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
    const startDay = new Date(data.data.startDay);
    const endDay = new Date(data.data.endDate);
    const formattedStartDay = startDay.toLocaleDateString(
      'es-uk',
      this.options,
    );
    const formattedEndDay = endDay.toLocaleDateString('es-uk', this.options);
    const differenceInMilliseconds: number = Number(endDay) - Number(startDay);
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    return await this.mailerService.sendMail({
      to: data.email,
      from: 'bangdpcgcd191292@fpt.edu.vn',
      subject: 'DaNang Travel',
      text: 'Welcome',
      html: `<b>Welcome to DA NANG Travel</b></br>
             <div style="width: 70vw">
             <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: fit-content; margin: 24px">
             <div>
                  <p>Hi ${data.email}</p>
                  <p>Code Tour: ${data.data.id}<b></b></p> </br>
                  <p>Tour Name: ${data.data.tourName}<b></b></p> </br>
                  <p>Price: ${price}</p> </br>
                  <p>Participants: ${data.data.participants} <b>People</b></p> </br>
                  <p>Start: ${formattedStartDay}</p> </br>
                  <p>End: ${formattedEndDay} </p> </br>
                  <p>Total Day: ${differenceInDays} <b>days</b></p> </br>
                  </br>
                  </div>
            </div>
            </div>
            <p><b>Thank You Cause Booking Tour In DANANG Travel</b></p>`,
    });
  }
  async EmailToken(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('can not find token');
      }
      const payload = await this.authService
        .send({ cmd: 'decode-jwt' }, { jwt: token })
        .toPromise();
      if (!payload.data) {
        throw new BadRequestException('can not validate token');
      }
      return { userId: payload.data.id, accessToken: token };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async validationEmailRegister(userId: string, accessToken: string) {
    const findUser = await this.usersRepository.findOneById(userId);
    if (findUser.isEmailValidated === true) {
      throw new BadRequestException('Email already confirmed');
    }
    const user = await this.usersRepository.save({
      ...findUser,
      isEmailValidated: true,
    });
    delete user.password;
    return { accessToken: accessToken, user };
  }
  async sendMailUserBefore3Days(
    tourId: string,
    tourName: string,
    email: string,
    particulars: number,
    startDate: Date,
    endDate: Date,
  ) {
    const startDay = new Date(startDate);
    const endDay = new Date(endDate);
    const formattedStartDay = startDay.toLocaleDateString(
      'es-uk',
      this.options,
    );
    const formattedEndDay = endDay.toLocaleDateString('es-uk', this.options);
    const differenceInMilliseconds: number = Number(endDay) - Number(startDay);
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
    console.log('1');
    return await this.mailerService.sendMail({
      to: email,
      from: 'bangdpcgcd191292@fpt.edu.vn',
      subject: 'DaNang Travel',
      text: 'Notification',
      html: `<b>DA NANG Travel Notification </b></br>
             <div style="width: 70vw">
             <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: fit-content; margin: 24px">
             <div>
                  <p>Hi ${email}</p>
                  <p>Code Tour: ${tourId}<b></b></p> </br>
                  <p>Tour Name: ${tourName}<b></b></p> </br>
                  <p>Participants: ${particulars} <b>People</b></p> </br>
                  <p>Start: ${formattedStartDay}</p> </br>
                  <p>End: ${formattedEndDay} </p> </br>
                  <p>Total Day: ${differenceInDays} <b>days</b></p> </br>
                  <p>Departure date remaining ${differenceInDays} <b>days</b></p> </br>
                  </br>
                  </div>
            </div>
            </div>
            <p><b>Thank You Cause using Tour In DANANG Travel</b></p>`,
    });
  }
}
