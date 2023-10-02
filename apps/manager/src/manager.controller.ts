import { Controller, Inject } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { RedisCacheService, SharedServiceInterface } from '@app/shared';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { TourService } from './tour/tour.service';
import {
  BookingTourDto,
  CartDto,
  CreateExperienceDto,
  ExperienceCommentDto,
  TourCommentDto,
  UpdateTouristDTO,
} from './tour/dtos';
import { SellerService } from './seller/seller.service';
import { NewStoreDTO } from './seller/dto';

@Controller()
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
    private readonly redisService: RedisCacheService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedServiceInterface,
    private readonly tourService: TourService,
    private readonly sellerService: SellerService,
  ) {}
  //tourService--------------------------
  @MessagePattern({ cmd: 'tour-by-id' })
  async tourHello(
    @Ctx() context: RmqContext,
    @Payload() payload: { tourId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.tourService.findTourDetail(payload.tourId);
  }
  @MessagePattern({ tour: 'get-all-tour' })
  async getAllStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { currentPage: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const cachedTourView = await this.redisService.get('tourViewPage');

    if (cachedTourView) {
      return cachedTourView;
    }

    const updatedTourView = await this.tourService.getAllTours(
      payload.currentPage,
    );

    await this.redisService.set('tourViewPage', updatedTourView);
    return updatedTourView;
  }
  @MessagePattern({ tour: 'create-tour' })
  async createTour(
    @Ctx() context: RmqContext,
    @Payload() data: any,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const storeOfUserOwner = await this.sellerService.findOneStoreById(
      payload.userId,
    );
    const value = await this.tourService.createTour(
      JSON.parse(data.data),
      storeOfUserOwner,
    );
    const dataRedis = await this.redisService.get('tourView');
    const newDataRedis =
      typeof dataRedis === 'object' ? { ...dataRedis, value } : { value };
    await this.redisService.set('tourView', newDataRedis);
    return value;
  }
  @MessagePattern({ tour: 'create-cart' })
  async createCart(
    @Ctx() context: RmqContext,
    @Payload() newCartDTO: CartDto,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const user = await this.managerService.findUserById(payload.userId);
    return await this.tourService.createCart(newCartDTO, user);
  }
  @MessagePattern({ tour: 'get-cart-by-userId' })
  async getCartByUserId(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.getCartByUserId(payload.userId);
  }
  @MessagePattern({ tour: 'delete-cart-by-id' })
  async deleteOneValueCartByTourIdOfUserId(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; tourId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.deleteAElementCartByUserIdAndTourId(
      payload.userId,
      payload.tourId,
    );
  }
  @MessagePattern({ tour: 'delete-all-cart-by-userId' })
  async deleteAllValueByUserId(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.deleteCartByUserId(payload.userId);
  }

  @MessagePattern({ tour: 'create-content-experience' })
  async createContentExperienceOfUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
    @Payload() createExperienceDto: CreateExperienceDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId } = payload;
    return await this.tourService.createContentExperienceOfUser(
      userId,
      createExperienceDto,
    );
  }
  @MessagePattern({ tour: 'get-comment-by-tourId' })
  async getCommentsByTourId(
    @Ctx() context: RmqContext,
    @Payload() payload: { tourId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.getCommentOfTour(payload.tourId);
  }
  @MessagePattern({ manager: 'update-tour' })
  async updateTourist(
    @Ctx() context: RmqContext,
    @Payload() updateTouristDto: UpdateTouristDTO,
    @Payload() payload: { tourId: string; userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.updateTour(payload.tourId, payload.userId, {
      ...updateTouristDto,
    });
  }
  @MessagePattern({ manager: 'booking-tour' })
  async bookingTour(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; tourId: string },
    @Payload() bookingTourDto: BookingTourDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId, tourId } = payload;
    return this.tourService.bookingTour(tourId, userId, { ...bookingTourDto });
  }
  @MessagePattern({ cmd: 'create-comment-tour' })
  async createCommentTour(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
    @Payload() tourCommentDto: TourCommentDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.tourService.createCommentOfTour(payload.userId, tourCommentDto);
  }

  @MessagePattern({ cmd: 'create-comment-experience' })
  async createCommentExperienceOfUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
    @Payload() experienceCommentDto: ExperienceCommentDto,
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId } = payload;
    return this.tourService.createCommentOfExperienceOfUser(
      userId,
      experienceCommentDto,
    );
  }

  @MessagePattern({ tour: 'get-experience' })
  async getExperienceOfUser(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    const getExperienceOfUserCache = await this.redisService.get(
      'getExperienceOfUserCachePage',
    );
    if (getExperienceOfUserCache) {
      return getExperienceOfUserCache;
    }
    const getExperienceOfUser = await this.tourService.getExperienceOfUser();
    await this.redisService.set(
      'getExperienceOfUserCachePage',
      getExperienceOfUser,
    );
    return getExperienceOfUser;
  }

  @MessagePattern({ tour: 'get-experience-page' })
  async getExperiencePage(
    @Ctx() context: RmqContext,
    @Payload() payload: { page: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.getExperienceOfUserPage(payload.page);
  }
  @MessagePattern({ tour: 'upvote-tour' })
  async upvoteOfTour(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; tourId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.tourService.upvoteOfTour(payload.userId, payload.tourId);
  }

  @MessagePattern({ tour: 'upvote-experience' })
  async upvoteOfExperienceOfUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; experienceId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const { userId, experienceId } = payload;
    return this.tourService.upvoteOfExperienceOfUser(userId, experienceId);
  }
  @MessagePattern({ tour: 'delete-tour-by-id' })
  async deleteTourById(
    @Ctx() context: RmqContext,
    @Payload() payload: { tourId: string; userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.deleteTour(payload.tourId, payload.userId);
  }

  @MessagePattern({ tour: 'search-tour' })
  async searchManyTourByName(
    @Ctx() context: RmqContext,
    @Payload()
    payload: {
      tourName: string;
      minPrice: number;
      maxPrice: number;
      startAddress: string;
      startDay: Date;
      endDay: Date;
      currentPage: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.searchTour(
      payload.tourName,
      payload.startAddress,
      payload.minPrice,
      payload.maxPrice,
      payload.startDay,
      payload.endDay,
      payload.currentPage,
    );
  }
  @MessagePattern({ tour: 'search-experience' })
  async searchExperiencesByTitle(
    @Ctx() context: RmqContext,
    @Payload()
    payload: {
      title?: string;
      page: number;
    },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.searchExperience(
      payload?.title,
      payload.page,
    );
  }
  // @MessagePattern({ cmd: 'get-tours' })
  // async getAllTour(@Ctx() context: RmqContext) {
  //   this.sharedService.acknowledgeMessage(context);
  //   return this.tourService.getTours();
  // }
  //-----------seller------------------
  @MessagePattern({ manager: 'create-store' })
  async createStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
    @Payload() newStoreDTO: NewStoreDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    const user = await this.managerService.findUserById(payload.userId);
    return this.sellerService.createStore(newStoreDTO, user);
  }
  @MessagePattern({ manager: 'get-tour-to-Store' })
  async getTourToStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; currentPage: number },
  ) {
    const getTourOfStore = await this.redisService.get('getAllTourOfStore');
    if (getTourOfStore) {
      return getTourOfStore;
    }
    const tour = await this.sellerService.getTourOfStorePage(
      payload.userId,
      payload.currentPage,
    );
    await this.redisService.set('getAllTourOfStore', tour);
    return tour;
  }
  @MessagePattern({ manager: 'bill-store' })
  async getBillOfEachStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; page: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getBillOfStore(
      payload.userId,
      payload.page,
    );
  }
  @MessagePattern({ manager: 'get-follower-user' })
  async getFollowerTripRegisteredUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getFollowerTripRegisteredUser(
      payload.userId,
    );
  }
  @MessagePattern({ manager: 'get-bill-user' })
  async getBillOfUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getBillOfUser(payload.userId);
  }
  @MessagePattern({ manager: 'data-each-month-store' })
  async getDataIncomeEachMonth(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getDataIncomeEachMonth(payload.userId);
  }
  @MessagePattern({ manager: 'StatisticalDataDashBoard' })
  async getStatisticalDataDashBoard(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string; month: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getStatisticalDataDashBoard(
      payload.userId,
      payload.month,
    );
  }
}
