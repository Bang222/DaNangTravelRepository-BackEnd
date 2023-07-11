import { NestFactory } from '@nestjs/core';
import { PostModule } from './post.module';
import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(PostModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  const queue = configService.get<string>('RABBITMQ_FEED_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices().then(() => console.log('service AUTH STARTED'));
}
bootstrap();
