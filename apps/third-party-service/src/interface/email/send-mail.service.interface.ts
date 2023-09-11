import { configDataSendMail } from '../../send-mail/dto';

export interface SendMailServiceInterface {
  EmailToken(token: string);
  validationEmailRegister(email: string, accessToken: string);
  sendEmailToToken(email: string);
  sendEmailBooking(data: configDataSendMail);
  sendMailUserBefore3Days(
    tourId: string,
    tourName: string,
    email: string,
    particulars: number,
    startDate: Date,
    endDate: Date,
  );
}
