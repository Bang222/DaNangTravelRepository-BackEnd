export interface SendMailServiceInterface {
  EmailToken(token: string);
  validationEmailRegister(email: string);
  sendEmailToToken(email: string);
}
