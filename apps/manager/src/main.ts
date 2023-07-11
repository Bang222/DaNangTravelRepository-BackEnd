import { NestFactory } from '@nestjs/core';
import { ManagerModule } from './manager.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ManagerModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const queue = configService.get<string>('RABBITMQ_MANAGER_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app
    .startAllMicroservices()
    .then(() => console.log('SERVICE Manager STARTED'));
  await app.listen(8080);
}
bootstrap();
