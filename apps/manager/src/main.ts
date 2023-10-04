import { NestFactory } from '@nestjs/core';
import { ManagerModule } from './manager.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';
import * as compression from 'compression';
// import { ManagerService } from './manager.service';

async function bootstrap() {
  const app = await NestFactory.create(ManagerModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);
  // const baseData = app.get(ManagerService);
  // await baseData.onModuleInit();
  const manager_queue = configService.get<string>('RABBITMQ_MANAGER_QUEUE');
  const tour_queue = configService.get<string>('RABBITMQ_TOUR_QUEUE');
  app.connectMicroservice(sharedService.getRmqOptions(tour_queue));
  app.connectMicroservice(sharedService.getRmqOptions(manager_queue));
  app
    .startAllMicroservices()
    .then(() => console.log('SERVICE Manager STARTED'));
  app.use(
    compression({
      threshold: 100 * 1000,
    }),
  );
  await app.listen(8080);
}
bootstrap();
