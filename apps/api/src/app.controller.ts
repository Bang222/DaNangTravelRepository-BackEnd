import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {ExistingUserDTO, NewUserDTO} from '../../auth/src/dto';
import {AuthGuard, UserRequest} from '@app/shared';
import {UserInterceptor} from '@app/shared/interceptors/user.interceptor';
import {Roles} from '../../auth/src/decorator/roles.decorator';
import {Role} from '@app/shared/models/enum';
import {UseRoleGuard} from '../../auth/src/guard/role.guard';
import {
  BookingTourDto,
  CartDto,
  CreateExperienceDto,
  ExperienceCommentDto,
  NewTouristDTO,
  TourCommentDto,
  UpdateTouristDTO,
} from '../../manager/src/tour/dtos';
import {NewStoreDTO} from '../../manager/src/seller/dto';
import {Throttle} from '@nestjs/throttler';
import {ThrottlerBehindProxyGuard} from './throttler-behind-proxy.guard';
import {catchError, of} from 'rxjs';
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import {CloudinaryService} from '../../third-party-service/src/cloudinary/cloudinary.service';

@Throttle(30, 60)
@UseGuards(ThrottlerBehindProxyGuard)
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
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  //Search-----------------------------------
  @Throttle(200, 60)
  @Get('tour/page=:currentPage/search=')
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  async searchTour(
    @Query('name') tourName: string,
    @Query('start') startAddress: string,
    @Query('min') minPrice: number,
    @Query('max') maxPrice: number,
    @Query('start-day') startDay: Date,
    @Query('end-day') endDay: Date,
    @Param('currentPage', ParseIntPipe) currentPage: number,
  ) {
    return this.managerService.send(
      { tour: 'search-tour' },
      {
        tourName,
        startAddress,
        minPrice,
        maxPrice,
        startDay,
        endDay,
        currentPage,
      },
    );
  }
  @Throttle(200, 60)
  @Get('experience/page=:page/search=')
  async searchExperience(
    @Param('page', ParseIntPipe) page: string,
    @Query('title') title: string,
  ) {
    return this.managerService.send(
      { tour: 'search-experience' },
      { title, page },
    );
  }
  @Get('admin/get-all-store')
  // @UseGuards(AuthGuard, UseRoleGuard)
  // @Roles(Role.SELLER)
  async getAllStore() {
    return this.managerService.send({ admin: 'get-all-store-admin' }, {});
  }
  // MANAGER---------------------------------------
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
  @UseInterceptors(FileInterceptor('file'))
  async createReview(
    @Req() req: UserRequest,
    @Body() createExperienceDto: CreateExperienceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('can not found');
    }
    const image = await this.cloudinaryService.uploadFile(file);
    if (!image) {
      throw new Error('can not found');
    }
    const { content, anonymous, title } = createExperienceDto;
    return this.tourService.send(
      { tour: 'create-content-experience' },
      {
        userId: req.user?.id,
        content,
        anonymous,
        imgUrl: image.secure_url,
        title,
      },
    );
  }

  @Get('experience/all')
  async getReview() {
    return this.tourService.send({ tour: 'get-experience' }, {});
  }
  @Throttle(200, 60)
  @Get('experience/page=:page')
  async getReviewPage(@Param('page', ParseIntPipe) page: string) {
    return this.tourService.send({ tour: 'get-experience-page' }, { page });
  }

  @Post('tour/upvote')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.USER, Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async upvoteOfTour(@Req() req: UserRequest, @Body('tourId') tourId: string) {
    return this.tourService.send(
      { tour: 'upvote-tour' },
      { userId: req?.user.id, tourId },
    );
  }
  @Post('tour/delete')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.PREMIUM, Role.SELLER)
  @UseInterceptors(UserInterceptor)
  async tourDeleteById(
    @Req() req: UserRequest,
    @Body('tourId') tourId: string,
  ) {
    if (!tourId) {
      throw new BadRequestException('tourId is required');
    }
    const userId = req.headers['x-client-id'];
    return this.tourService.send(
      { tour: 'delete-tour-by-id' },
      { tourId, userId },
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
    if (!experienceId) {
      return new BadRequestException('can not found');
    }
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
  @Roles(Role.USER, Role.ADMIN, Role.PREMIUM, Role.SELLER)
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

  @Get('store/data-each-month')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER, Role.PREMIUM)
  async(@Req() req) {
    const userId = req.headers['x-client-id'];
    return this.managerService.send(
      { manager: 'data-each-month-store' },
      { userId: userId },
    );
  }

  @Throttle(5, 10)
  @Get('user/order-history')
  @UseGuards(AuthGuard, UseRoleGuard, ThrottlerBehindProxyGuard)
  @Roles(Role.USER, Role.SELLER, Role.PREMIUM, Role.ADMIN)
  @UseInterceptors(UserInterceptor)
  async getBillUser(@Req() req: UserRequest) {
    return this.managerService.send(
      { manager: 'get-bill-user' },
      { userId: req.user?.id },
    );
  }

  @Get('store/bill/page=:page')
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER, Role.PREMIUM)
  @UseInterceptors(UserInterceptor)
  async getBillStore(
    @Req() req: UserRequest,
    @Param('page', ParseIntPipe) page: number,
  ) {
    return this.managerService.send(
      { manager: 'bill-store' },
      { userId: req.user?.id, page: page },
    );
  }

  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER, Role.PREMIUM)
  @Get('store/dash-board/data/month=:month')
  async StatisticalDataDashBoard(
    @Req() req,
    @Param('month', ParseIntPipe) month: number,
  ) {
    const userId = req.headers['x-client-id'];
    if (!userId) throw new BadRequestException('can not find');
    return this.managerService.send(
      { manager: 'StatisticalDataDashBoard' },
      { userId: userId, month: month },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('delete-cart-by-id')
  async deleteOneValueCartByTourIdOfUserId(
    @Body() tourIdDTO: CartDto,
    @Req() req,
  ) {
    const { tourId } = tourIdDTO;
    const userId = req.headers['x-client-id'];
    return this.tourService.send(
      { tour: 'delete-cart-by-id' },
      { tourId, userId: userId },
    );
  }
  @UseGuards(AuthGuard)
  @Post('delete-all-cart')
  async deleteAllValueCartByUserId(@Req() req) {
    const userId = req.headers['x-client-id'];
    return this.tourService.send(
      { tour: 'delete-all-cart-by-userId' },
      { userId: userId },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('cart')
  async addToCart(@Body() newCartDTO: CartDto, @Req() req: UserRequest) {
    const { tourId } = newCartDTO;
    return this.tourService.send(
      { tour: 'create-cart' },
      { tourId, userId: req.user?.id },
    );
  }

  @UseGuards(AuthGuard)
  @Get('get-cart')
  async getCartByUserId(@Req() req) {
    const userId = req.headers['x-client-id'];
    return this.tourService.send(
      { tour: 'get-cart-by-userId' },
      { userId: userId },
    );
  }

  @UseGuards(AuthGuard)
  @Post('tour-by-id')
  async getTourById(@Body('tourId') tourId: string) {
    if (!tourId) {
      return new BadRequestException('can not null Id');
    }
    return this.managerService.send({ cmd: 'tour-by-id' }, { tourId });
  }

  @Throttle(200, 60)
  @UseGuards(ThrottlerBehindProxyGuard)
  @Get('tour/all/page=:currentPage')
  async getAllTour(@Param('currentPage', ParseIntPipe) currentPage: number) {
    return this.tourService.send({ tour: 'get-all-tour' }, { currentPage });
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
    return this.managerService.send(
      { manager: 'update-tour' },
      {
        ...updateTouristDto,
        tourId: tourId,
        userId: req?.user.id,
      },
    );
  }

  @UseInterceptors(UserInterceptor)
  @UseGuards(AuthGuard, UseRoleGuard)
  @Roles(Role.SELLER)
  @UseInterceptors(FilesInterceptor('files[]', 10))
  @Post('tour/create')
  async createTour(
    @Body() newTouristDTO: NewTouristDTO,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: UserRequest,
  ) {
    if (files.length === 0) {
      return Error('can not found');
    }
    const images = await this.cloudinaryService.uploadFiles(files);
    if (images?.length === 0) {
      return Error('can not found');
    }
    const data = JSON.stringify({ ...newTouristDTO, imageUrl: images });
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
  @Get('store/list-tour/page=:currentPage')
  async getTourToStore(
    @Req() req: UserRequest,
    @Param('currentPage', ParseIntPipe) currentPage: number,
  ) {
    if (!req?.user) {
      return 'you can not allow to do that';
    }
    return this.managerService.send(
      { manager: 'get-tour-to-Store' },
      { userId: req.user?.id, currentPage },
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
    return this.authService
      .send(
        { cmd: 'register' },
        {
          firstName,
          lastName,
          email,
          password,
          sex,
          address,
        },
      )
      .pipe(
        catchError((err) => {
          return of(err);
        }),
      );
  }

  @Post('auth/login')
  async login(@Body() existingUserDTO: ExistingUserDTO) {
    const { email, password } = existingUserDTO;
    return this.authService.send({ cmd: 'login' }, { email, password });
  }

  @Post('auth/login/google')
  async loginGoogle(@Body('accessToken') accessToken: string) {
    if (!accessToken) {
      return new BadRequestException('can not found token ID');
    }
    return this.authService.send({ cmd: 'login-google' }, { accessToken });
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
    return response.redirect('http://localhost:3000/login');
  }
  @Get('payment')
  @UseGuards(AuthGuard)
  async paymentPayPal() {
    try {
      return { data: process.env.CLIENT_ID_PAYPAL };
    } catch (e) {
      return e;
    }
  }
  // @Get('payment')
  // @UseGuards(AuthGuard)
  // async paymentPayPal() {
  //   try {
  //     return { data: process.env.CLIENT_ID_PAYPAL };
  //   } catch (e) {
  //     return e;
  //   }
  // }

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
