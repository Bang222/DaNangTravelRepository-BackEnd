import { Injectable } from '@nestjs/common';
import { PresenceServiceInterface } from './interfaces/presence.service.interface';
import { RedisCacheService } from '@app/shared';
import { ActiveUser } from './interfaces/ActiveUser';

@Injectable()
export class PresenceService implements PresenceServiceInterface {
  constructor(private readonly redisService: RedisCacheService) {}
  getHello() {
    console.log('not Cached');
    return { helloBang: 'Hello World!' };
  }
  async getActiveUser(id: number) {
    const user = await this.redisService.get(`user ${id}`);
    return user as ActiveUser | undefined;
  }
}
