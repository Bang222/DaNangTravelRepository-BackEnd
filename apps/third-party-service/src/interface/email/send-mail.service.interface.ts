export interface SendMailServiceInterface {
  EmailToken(token: string);
  validationEmailRegister(email: string, accessToken: string);
  sendEmailToToken(email: string);
}
