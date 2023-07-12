import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
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
import { NewTouristDTO } from '../../manager/src/tour/dtos';
import {NewStoreDTO} from "../../manager/src/seller/dto";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
    @Inject('MANAGER_SERVICE') private managerService: ClientProxy,
  ) {}

  @Get()
  @UseGuards(UseRoleGuard, AuthGuard)
  @Roles(Role.USER)
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }
  @Get('manager')
  async getManagerHello() {
    return this.managerService.send({ cmd: 'manager' }, {});
  }
  // MANAGER
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Get('tour')
  async getTourHello(@Req() req: UserRequest) {
    return this.managerService.send({ cmd: 'tour' }, { id: req.user.id });
  }
  @Get('tour/all')
  async getAllTour() {
    return this.managerService.send({ cmd: 'get-tours' }, {});
  }
  @Post('manager/create-tour')
  async createTour(@Body() newTouristDTO: NewTouristDTO) {
    const {
      name,
      description,
      price,
      quantity,
      address,
      imageUrl,
      startDate,
      endDate,
      lastRegisterDate,
    } = newTouristDTO;
    return this.managerService.send(
      { cmd: 'create-tour' },
      {
        name,
        description,
        price,
        quantity,
        address,
        imageUrl,
        startDate,
        endDate,
        lastRegisterDate,
      },
    );
  }
  @UseInterceptors(UserInterceptor)
  @Get('user-detail')
  async getUserId(@Req() req: UserRequest) {
    return this.authService.send({ cmd: 'get-user' }, { id: req.user.id });
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
  @UseGuards(AuthGuard)
  @Post('auth')
  async postUser() {
    return this.authService.send({ cmd: 'post-user' }, {});
  }
  @Post('auth/register')
  @UsePipes(new ValidationPipe())
  async register(@Body() newUser: NewUserDTO) {
    const { firstName, lastName, email, password, sex } = newUser;
    return this.authService.send(
      { cmd: 'register' },
      {
        firstName,
        lastName,
        email,
        password,
        sex,
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
    @Param('friendId') friendId: string,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.authService.send(
      { cmd: 'add-friend' },
      { userId: req.user.id, friendId },
    );
  }
  @UseGuards(AuthGuard)
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
  @Get('email-verify')
  async emailVerifyToKen(@Query('token') jwt: string) {
    return this.authService.send(
      {
        cmd: 'verify-jwt',
      },
      { jwt },
    );
  }
  @UseGuards(AuthGuard)
  @Post('store/create')
  async createStore(@Body() newStoreDTO: NewStoreDTO, @Req() req: UserRequest) {
    const { name, slogan } = newStoreDTO;
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.managerService.send({ cmd: 'create-store' }, { name, slogan });
  }
}
