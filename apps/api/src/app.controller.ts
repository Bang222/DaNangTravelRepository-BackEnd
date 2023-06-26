import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { ExistingUserDTO, NewUserDTO } from '../../auth/src/dto';
import { AuthGuard, UserRequest } from '@app/shared';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { Roles } from '../../auth/src/decorator/roles.decorator';
import { Role } from '@app/shared/models/enum';
import { UseRoleGuard } from '../../auth/src/guard/role.guard';

@Controller()
@UseInterceptors(UserInterceptor)
@UseGuards(AuthGuard)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  @UseGuards(UseRoleGuard)
  @Roles(Role.ADMIN)
  async getUser() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }
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
  @UsePipes(new ValidationPipe())
  async register(@Body() newUser: NewUserDTO) {
    const { firstName, lastName, email, password } = newUser;
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
  async login(@Body() existingUserDTO: ExistingUserDTO) {
    const { email, password } = existingUserDTO;
    return this.authService.send({ cmd: 'login' }, { email, password });
  }
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.authService.send(
      { cmd: 'add-friend' },
      { userId: req.user.id, friendId },
    );
  }
  @Get('get-friends')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      },
    );
  }
}
