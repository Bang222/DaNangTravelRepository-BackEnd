import { configDataSendMail } from '../../send-mail/dto';

export interface SendMailServiceInterface {
  EmailToken(token: string);
  validationEmailRegister(email: string, accessToken: string);
  sendEmailToToken(email: string);
  sendEmailBooking(data: configDataSendMail);
}
