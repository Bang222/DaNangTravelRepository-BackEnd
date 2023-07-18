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
import { ClientProxy } from '@nestjs/microservices';
import { ExistingUserDTO, NewUserDTO } from '../../auth/src/dto';
import { AuthGuard, UserRequest } from '@app/shared';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptor';
import { Roles } from '../../auth/src/decorator/roles.decorator';
import { Role } from '@app/shared/models/enum';
import { UseRoleGuard } from '../../auth/src/guard/role.guard';
import {CartDto, NewTouristDTO, UpdateTouristDTO} from '../../manager/src/tour/dtos';
import { NewStoreDTO } from '../../manager/src/seller/dto';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
    @Inject('MANAGER_SERVICE') private managerService: ClientProxy,
  ) {}

  // MANAGER----------------------------------------
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('cart')
  async getAllStore(@Body() newCartDTO: CartDto, @Req() req: UserRequest) {
    const { tourId, quantity } = newCartDTO;
    return this.managerService.send(
      { cmd: 'create-cart' },
      { tourId, quantity, userId: req.user?.id },
    );
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Get('tour')
  async getTourHello(@Req() req: UserRequest) {
    return this.managerService.send({ cmd: 'tour' }, { id: req.user.id });
  }

  @Get('tour/all')
  async getAllTour() {
    return this.managerService.send({ cmd: 'get-all-tour' }, {});
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.SELLER)
  @Get('checkout')
  async checkOut(@Req() req: UserRequest) {
    return this.managerService.send({ cmd: 'check-out' }, { user: req?.user });
  }
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER)
  @Post('tour/update/:id')
  async updateTour(
    @Req() req: UserRequest,
    @Param('id') tourId: string,
    @Body() updateTouristDto: UpdateTouristDTO,
  ) {
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
    } = updateTouristDto;
    // console.log('updateTouristDto: ', updateTouristDto.address);
    return this.managerService.send(
      { cmd: 'update-tour' },
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
        tourId,
        userId: req?.user.id,
      },
    );
  }
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER)
  @Post('tour/create')
  async createTour(
    @Body() newTouristDTO: NewTouristDTO,
    @Req() req: UserRequest,
  ) {
    console.log(req?.user);
    if (!req?.user) {
      return 'you can not allow to do that';
    }
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
        userId: req.user?.id,
      },
    );
  }
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Get('user-detail')
  async getUserId(@Req() req: UserRequest) {
    return this.authService.send({ cmd: 'get-user' }, { id: req.user.id });
  }
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER)
  @UseInterceptors(UserInterceptor)
  @Get('store/list-tour')
  async getTourToStore(@Req() req: UserRequest) {
    if (!req?.user) {
      return 'you can not allow to do that';
    }
    return this.managerService.send(
      { cmd: 'get-tour-to-Store' },
      { userId: req.user?.id },
    );
  }
  // PRESENCE----------------------------------------
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
  // AUTH----------------------------------------
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
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Post('store/create')
  async createStore(@Body() newStoreDTO: NewStoreDTO, @Req() req: UserRequest) {
    const { name, slogan } = newStoreDTO;
    // console.log(req.user);
    if (!req?.user) {
      throw new BadRequestException('can not find user');
    }
    return this.managerService.send(
      { cmd: 'create-store' },
      { name, slogan, userId: req.user.id },
    );
  }
}
