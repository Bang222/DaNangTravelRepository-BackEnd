import {Controller, Inject, UseFilters} from '@nestjs/common';
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
  NewTouristDTO,
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
  async getAllStore(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    const tourView = await this.redisService.get('tourView');
    if (tourView) {
      return tourView;
    }
    const setTourView = await this.tourService.getAllTours();
    await this.redisService.set('tourView', setTourView);
    return setTourView;
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
    return this.tourService.createTour(JSON.parse(data.data), storeOfUserOwner);
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
      'getExperienceOfUserCache',
    );
    if (getExperienceOfUserCache) {
      return getExperienceOfUserCache;
    }
    const getExperienceOfUser = await this.tourService.getExperienceOfUser();
    await this.redisService.set(
      'getExperienceOfUserCache',
      getExperienceOfUser,
    );
    return getExperienceOfUser;
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
    @Payload() payload: { userId: string },
  ) {
    const getTourOfStore = await this.redisService.get('getTourOfStore');
    if (getTourOfStore) {
      return getTourOfStore;
    }
    const tour = await this.sellerService.getTourEachStore(payload.userId);
    await this.redisService.set('getTourOfStore', tour);
    return tour;
  }
  @MessagePattern({ manager: 'bill-store' })
  async getBillOfEachStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getBillOfStore(payload.userId);
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
  @MessagePattern({ manager: 'track-user-registered-trip' })
  async getTrackUserRegisteredTourStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.sellerService.getTrackUserRegisteredTourStore(
      payload.userId,
    );
  }
}
