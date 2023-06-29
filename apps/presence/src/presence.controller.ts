import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { PresenceService } from './presence.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RedisCacheService, SharedService } from '@app/shared';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly redisService: RedisCacheService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}
  @MessagePattern({ cmd: 'get-presence' })
  @UseInterceptors(CacheInterceptor)
  async getPresence(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    const hello = await this.redisService.get('hello');
    if (hello) {
      console.log('Cache');
      return hello;
    }
    const h = this.presenceService.getHello();
    await this.redisService.set('hello', h);
    return h;
  }
  @MessagePattern({ cmd: 'get-active-user' })
  async getActiveUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.presenceService.getActiveUser(payload.id);
  }
}
