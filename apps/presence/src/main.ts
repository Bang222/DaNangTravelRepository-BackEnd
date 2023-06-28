import { NestFactory } from '@nestjs/core';
import { PresenceModule } from './presence.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(PresenceModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const queue = configService.get<string>('RABBITMQ_PRESENCE_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app
    .startAllMicroservices()
    .then(() => console.log('service PRESENCE STARTED'));
  await app.listen(6000);
}
bootstrap();
