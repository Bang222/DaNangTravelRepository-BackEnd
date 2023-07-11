import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { SharedModule } from '@app/shared';

@Module({
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
