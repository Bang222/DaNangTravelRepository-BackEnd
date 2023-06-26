import { Controller, Get, Inject } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { SharedService } from '@app/shared';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}
  @Get()
  async Gelle() {
    return 'bang';
  }
  @MessagePattern({ cmd: 'get-presence' })
  async getPresence(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.presenceService.getHello();
  }
}
