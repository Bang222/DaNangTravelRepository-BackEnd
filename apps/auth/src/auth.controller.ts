import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { ExistingUserDto, NewUserDto } from '../dtos';
import { JwtGuard } from "./jwt.guard";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }
  @MessagePattern({ cmd: 'get-users' })
  async getUser(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.getUsers();
  }
  // @MessagePattern({ cmd: 'post-user' })
  // async postUser(@Ctx() context: RmqContext) {
  //   this.sharedService.acknowledgeMessage(context);
  //   return await this.authService.postUser();
  // }
  @MessagePattern({ cmd: 'register' }) // getup API gateway
  async register(@Ctx() context: RmqContext, @Payload() newUser: NewUserDto) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.register(newUser);
  }
  @MessagePattern({ cmd: 'login' }) // getup API gateway
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.authService.login(existingUser);
  }
  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }
}
