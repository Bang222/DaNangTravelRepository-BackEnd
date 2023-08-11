import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(
    compression({
      threshold: 100 * 1000,
    }),
  );
  app.use(helmet()); // ngăn chặn trang thứ 3 vào cookie và chặn k có thấy header những thông tin nhạy cảm như code bằng gì
  await app.listen(5000);
}
bootstrap();
