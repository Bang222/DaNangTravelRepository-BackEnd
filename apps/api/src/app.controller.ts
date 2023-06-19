import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@app/shared';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  async getUser() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }
  @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
  @Post('auth')
  async postUser() {
    return this.authService.send({ cmd: 'post-user' }, {});
  }
  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      { cmd: 'register' },
      {
        firstName,
        lastName,
        email,
        password,
      },
    );
  }
  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send({ cmd: 'login' }, { email, password });
  }
}
