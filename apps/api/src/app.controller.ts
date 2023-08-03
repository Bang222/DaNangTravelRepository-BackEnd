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
  Res,
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
import {
  BookingTourDto,
  CartDto,
  CreateExperienceDto,
  ExperienceCommentDto,
  NewTouristDTO,
  TourCommentDto,
  UpdateTouristDTO,
} from '../../manager/src/tour/dtos';
import { NewStoreDTO } from '../../manager/src/seller/dto';
import { CookieResInterceptor } from '@app/shared/interceptors/cookie-res.interceptor';
import { Throttle } from '@nestjs/throttler';


@Throttle(9, 15)
@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('MANAGER_SERVICE') private managerService: ClientProxy,
    @Inject('MAIL_SERVICE') private emailService: ClientProxy,
    @Inject('SHARE_SERVICE')
    private socialSharingService: ClientProxy,
    @Inject('PAYMENT_SERVICE')
    private paymentService: ClientProxy,
    @Inject('TOUR_SERVICE')
    private tourService: ClientProxy,
  ) {}
  // MANAGER----------------------------------------
  @Post('experience/create/comment')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async createCommentExperience(
    @Req() req: UserRequest,
    @Body() experienceCommentDto: ExperienceCommentDto,
  ) {
    return this.managerService.send(
      { cmd: 'create-comment-experience' },
      { userId: req.user?.id, ...experienceCommentDto },
    );
  }
  @Post('tour/create/comment')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async createCommentTour(
    @Req() req: UserRequest,
    @Body() tourCommentDto: TourCommentDto,
  ) {
    return this.managerService.send(
      { cmd: 'create-comment-tour' },
      { userId: req.user?.id, ...tourCommentDto },
    );
  }
  @Post('experience/create')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async createReview(
    @Req() req: UserRequest,
    @Body() createExperienceDto: CreateExperienceDto,
  ) {
    const { content, anonymous } = createExperienceDto;
    return this.tourService.send(
      { tour: 'create-content-experience' },
      { userId: req.user?.id, content, anonymous },
    );
  }
  @Get('experience/all')
  async getReview() {
    return this.tourService.send({ tour: 'get-experience' }, {});
  }
  @Post('tour/upvote')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Throttle(2, 10)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async upvoteOfTour(@Req() req: UserRequest, @Body('tourId') tourId: string) {
    return this.tourService.send(
      { tour: 'upvote-tour' },
      { userId: req?.user.id, tourId },
    );
  }
  @Post('experience/upvote')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async upvoteOfReview(
    @Req() req: UserRequest,
    @Body('experienceId') experienceId: string,
  ) {
    return this.tourService.send(
      { tour: 'upvote-experience' },
      { userId: req?.user.id, experienceId },
    );
  }
  @Get('user/track-trip')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER)
  @UseInterceptors(UserInterceptor)
  async getFollowerTripRegisteredUser(@Req() req: UserRequest) {
    return this.managerService.send(
      { manager: 'get-follower-user' },
      { userId: req.user?.id },
    );
  }
  @Post('booking/:id')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER)
  @UseInterceptors(UserInterceptor)
  async bookingTour(
    @Req() req: UserRequest,
    @Param('id') tourId: string,
    @Body() bookingTourDto: BookingTourDto,
  ) {
    return this.managerService.send(
      { manager: 'booking-tour' },
      { ...bookingTourDto, tourId: tourId, userId: req.user?.id },
    );
  }

  @Get('store/user-registered')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER, Role.PREMIUM)
  @UseInterceptors(UserInterceptor)
  async getTrackUserRegisteredTourStore(@Req() req: UserRequest) {
    return this.managerService.send(
      { manager: 'track-user-registered-trip' },
      { userId: req.user?.id },
    );
  }

  @Get('user/order-history')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER)
  @UseInterceptors(UserInterceptor)
  async getBillUser(@Req() req: UserRequest) {
    return this.managerService.send(
      { manager: 'get-bill-user' },
      { userId: req.user?.id },
    );
  }
  @Get('store/bill')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER, Role.PREMIUM)
  @UseInterceptors(UserInterceptor)
  async getBillStore(@Req() req: UserRequest) {
    return this.managerService.send(
      { manager: 'bill-store' },
      { userId: req.user?.id },
    );
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('cart')
  async getAllStore(@Body() newCartDTO: CartDto, @Req() req: UserRequest) {
    const { tourId } = newCartDTO;
    return this.tourService.send(
      { tour: 'create-cart' },
      { tourId, userId: req.user?.id },
    );
  }

  @UseGuards(AuthGuard)
  @Post('tour-by-id')
  async getTourById(@Body('tourId') tourId: string) {
    if (!tourId) {
      return 'can not null id';
    }
    return this.managerService.send({ cmd: 'tour-by-id' }, { tourId });
  }

  @Get('tour/all')
  // @UseInterceptors(UserInterceptor)
  async getAllTour() {
    return this.tourService.send({ tour: 'get-all-tour' }, {});
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.SELLER)
  @Get('create-content-experience')
  async createContentExperienceOfUser(
    @Req() req: UserRequest,
    @Body() content: string,
  ) {
    return this.managerService.send(
      { cmd: 'create-content-experience' },
      { userId: req.user?.id, content },
    );
  }
  @Post('tour/comments')
  async getCommentsByTourId(@Body('tourId') tourId: string) {
    if (!tourId) {
      return 'can not null';
    }
    return this.tourService.send({ tour: 'get-comment-by-tourId' }, { tourId });
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
      startAddress,
      endingAddress,
    } = updateTouristDto;
    return this.managerService.send(
      { manager: 'update-tour' },
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
        startAddress,
        endingAddress,
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
    if (!req?.user) {
      return 'you can not allow to do that';
    }
    // const {
    //   name,
    //   description,
    //   price,
    //   quantity,
    //   address,
    //   imageUrl,
    //   startDate,
    //   endDate,
    //   lastRegisterDate,
    //   startAddress,
    //   endingAddress,
    // } = newTouristDTO;
    // console.log('api', JSON.stringify(newTouristDTO));
    const data = JSON.stringify(newTouristDTO);
    return this.tourService.send(
      { tour: 'create-tour' },
      {
        data,
        userId: req.user?.id,
      },
    );
  }
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Get('user-detail')
  async getUserId(@Req() req: UserRequest) {
    return this.authService.send({ cmd: 'get-user' }, { id: req.user?.id });
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
      { manager: 'get-tour-to-Store' },
      { userId: req.user?.id },
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
  @UseGuards(AuthGuard)
  @Post('auth')
  async postUser() {
    return this.authService.send({ cmd: 'post-user' }, {});
  }
  @Post('auth/register')
  async register(@Body() newUser: NewUserDTO) {
    const { firstName, lastName, email, password, sex, address } = newUser;
    return this.authService.send(
      { cmd: 'register' },
      {
        firstName,
        lastName,
        email,
        password,
        sex,
        address,
      },
    );
  }
  @UseInterceptors(CookieResInterceptor)
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
  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard)
  @Post('store/create')
  async createStore(@Body() newStoreDTO: NewStoreDTO, @Req() req: UserRequest) {
    const { name, slogan } = newStoreDTO;
    if (!req?.user) {
      throw new BadRequestException('can not find user');
    }
    return this.managerService.send(
      { manager: 'create-store' },
      { name, slogan, userId: req.user.id },
    );
  }
  //THIRD Party SERVICE
  @Get('validate-email')
  async validateTokenRegister(@Query('token') jwt: string, @Res() response) {
    const data = await this.emailService
      .send({ email: 'validate-email' }, { token: jwt })
      .toPromise();
    response.cookie('token', data.accessToken);
    return response.redirect('http://localhost:3000/');
  }
  @Get('email1')
  async helloThirdPartyService2() {
    return this.emailService.send({ email: 'smail' }, {});
  }
  @Get('email2')
  async helloThirdPartyService3() {
    return this.socialSharingService.send({ social: 'smail' }, {});
  }
  @Get('email3')
  async helloThirdPartyService4() {
    return this.paymentService.send({ payment: 'smail' }, {});
  }
  // @UseInterceptors(UserInterceptor)
  // @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req) {
    const userId = req.headers['x-client-id'];
    const refreshToken = req.headers['x-client-rf'];
    if (!userId && !refreshToken) return { msg: 'illegal' };
    return this.authService.send(
      { cmd: 'refreshToken' },
      { refreshToken: refreshToken, userId: userId },
    );
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.headers['x-client-id'];
    return this.authService.send({ cmd: 'log-out' }, { userId: userId });
  }
}
