import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerService {
  constructor() {}
  getHello(): string {
    return 'Hello World!';
  }
}
