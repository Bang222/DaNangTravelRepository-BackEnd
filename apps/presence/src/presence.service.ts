import { Injectable } from '@nestjs/common';
import { PresenceServiceInterface } from './interfaces/presence.service.interface';

@Injectable()
export class PresenceService implements PresenceServiceInterface {
  getHello() {
    console.log('not Cached');
    return { helloBang: 'Hello World!' };
  }
}
