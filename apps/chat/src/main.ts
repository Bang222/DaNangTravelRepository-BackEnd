import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { ChatModule } from './chat.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get<string>('RABBITMQ_CHAT_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices().then(() => console.log('service CHAT STARTED'));
  await app.listen(7000);
}
bootstrap();
