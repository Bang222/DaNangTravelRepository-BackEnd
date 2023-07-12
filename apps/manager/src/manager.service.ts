import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/src/auth.service';
import {AuthServiceInterface} from "../../auth/src/interface/auth.service.interface";

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
}
