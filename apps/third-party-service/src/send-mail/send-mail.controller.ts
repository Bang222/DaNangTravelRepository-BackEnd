import { Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { SendMailServiceInterface } from '../interface/email/send-mail.service.interface';
import { configDataSendMail } from './dto';

@Controller()
export class SendMailController {
  constructor(
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
    @Inject('SendMailServiceInterface')
    private readonly sendMailServiceInterface: SendMailServiceInterface,
  ) {}
  @MessagePattern({ email: 'send-email' })
  async sendmail(
    @Ctx() context: RmqContext,
    @Payload() payload: { email: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sendMailServiceInterface.sendEmailToToken(payload.email);
  }
  @MessagePattern({ email: 'send-booking' })
  async sendBooking(
    @Ctx() context: RmqContext,
    @Payload() data: configDataSendMail,
  ) {
    this.sharedService.acknowledgeMessage(context);
    console.log(data);
    return await this.sendMailServiceInterface.sendEmailBooking(data);
  }
  @MessagePattern({ email: 'validate-email' })
  async validateEmail(
    @Ctx() context: RmqContext,
    @Payload() payload: { token: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const data = await this.sendMailServiceInterface.EmailToken(payload.token);
    const { userId, accessToken } = data;
    return await this.sendMailServiceInterface.validationEmailRegister(
      userId,
      accessToken,
    );
  }
}
