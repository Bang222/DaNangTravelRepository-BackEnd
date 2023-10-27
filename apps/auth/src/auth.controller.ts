import { Controller, Get, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { ExistingUserDTO, NewUserDTO } from './dto';
import { UserInfoGoogle } from './dto/auth-google-login.dto';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface') private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }
  @MessagePattern({ cmd: 'refreshToken' })
  async handleRefreshToken(
    @Ctx()
    context: RmqContext,
    @Payload()
    payload: {
      refreshToken: string;
      userId: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.handleRefreshToken(
      payload.userId,
      payload.refreshToken,
    );
  }
  @MessagePattern({ cmd: 'sign-token' })
  async signToken(
    @Ctx()
    context: RmqContext,
    @Payload()
    payload: {
      userId: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.signTokenUsingPrivateKeyAndPublishKey(
      payload.userId,
    );
  }
  @MessagePattern({ cmd: 'get-users' })
  async getUser(
    @Ctx()
    context: RmqContext,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.getUsers();
  }
  @MessagePattern({ cmd: 'log-out' })
  async logOut(
    @Ctx()
    context: RmqContext,
    @Payload()
    payload: {
      userId: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.logOut(payload.userId);
  }
  @MessagePattern({ cmd: 'get-user' })
  async getUserById(
    @Ctx()
    context: RmqContext,
    @Payload()
    user: {
      id: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.getUserById(user.id);
  }
  @MessagePattern({ cmd: 'register' })
  async register(
    @Ctx()
    context: RmqContext,
    @Payload()
    newUser: NewUserDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.register(newUser);
  }
  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx()
    context: RmqContext,
    @Payload()
    existingUser: ExistingUserDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.login(existingUser);
  }
  @MessagePattern({ cmd: 'login-google' })
  async loginGoogle(
    @Ctx() context: RmqContext,
    @Payload() payload: { accessToken: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const userInfo = await this.authService.validateGoogle(payload.accessToken);
    return await this.authService.loginGoogle(userInfo as UserInfoGoogle);
  }
  @MessagePattern({ cmd: 'verify-jwt' })
  async verifyJwt(
    @Ctx()
    context: RmqContext,
    @Payload()
    payload: {
      jwt: string;
      userId: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.verifyJwt(payload.jwt, payload.userId);
  }
  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx()
    context: RmqContext,
    @Payload()
    payload: {
      jwt: string;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.getUserFromHeader(payload.jwt);
  }
}
