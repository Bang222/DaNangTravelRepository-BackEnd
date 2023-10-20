import { NestFactory } from '@nestjs/core';
import { ThirdPartyServiceModule } from './third-party-service.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ThirdPartyServiceModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const mail_queue = configService.get<string>('RABBITMQ_MAIL_QUEUE');
  const payment_queue = configService.get<string>('RABBITMQ_PAYMENT_QUEUE');
  const social_queue = configService.get<string>('RABBITMQ_SHARE_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(mail_queue));
  app.connectMicroservice(sharedService.getRmqOptions(payment_queue));
  app.connectMicroservice(sharedService.getRmqOptions(social_queue));
  app
    .startAllMicroservices()
    .then(() => console.log('SERVICE Third party service STARTED'));
  await app.listen(3001);
}
bootstrap();
