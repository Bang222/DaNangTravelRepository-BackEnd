import { Inject, Injectable } from '@nestjs/common';
import { AuthServiceInterface } from '../../auth/src/interface/auth.service.interface';

@Injectable()
export class ManagerService {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
  ) {}
  getHello(): string {
    console.log('authService ', this.authService.getHello());
    return 'Hello World!';
  }
  async findUserById(userId: string) {
    return await this.authService.findById(userId);
  }
}
