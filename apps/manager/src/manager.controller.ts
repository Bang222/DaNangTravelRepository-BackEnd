import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { RedisCacheService, SharedServiceInterface } from '@app/shared';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { TourService } from './tour/tour.service';
import { CartDto, NewTouristDTO, UpdateTouristDTO } from './tour/dtos';
import { SellerService } from './seller/seller.service';
import { NewStoreDTO } from './seller/dto';
import { AuthServiceInterface } from '../../auth/src/interface/auth.service.interface';

@Controller('manager')
export class ManagerController {
  constructor(
    private readonly managerService: ManagerService,
    private readonly redisService: RedisCacheService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedServiceInterface,
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
    private readonly tourService: TourService,
    private readonly sellerService: SellerService,
  ) {}
  @Get('hello')
  async hello() {
    return this.managerService.getHello();
  }
  //tourService--------------------------
  @MessagePattern({ cmd: 'tour' })
  async tourHello(
    @Ctx() context: RmqContext,
    @Payload() payload: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return this.tourService.tourHello(payload.id);
  }
  @MessagePattern({ cmd: 'get-all-tour' })
  async getAllStore(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    const tourView = await this.redisService.get('tourView');
    if (tourView) {
      console.log('cache');
      return tourView;
    }
    const setTourView = await this.tourService.getAllTours();
    await this.redisService.set('tourView', setTourView);
    return setTourView;
  }
  @MessagePattern({ cmd: 'create-tour' })
  async createTour(
    @Ctx() context: RmqContext,
    @Payload() newTourDto: NewTouristDTO,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const storeOfUserOwner = await this.sellerService.findOneStoreById(
      payload.userId,
    );
    return this.tourService.createTour(newTourDto, storeOfUserOwner);
  }
  @MessagePattern({ cmd: 'create-cart' })
  async createCart(
    @Ctx() context: RmqContext,
    @Payload() newCartDTO: CartDto,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    const user = await this.managerService.findUserById(payload.userId);
    return await this.tourService.createCart(newCartDTO, user);
  }
  @MessagePattern({ cmd: 'check-out' })
  async checkout(@Ctx() context: RmqContext, @Payload() payload: { user }) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.checkout(payload.user);
  }
  @MessagePattern({ cmd: 'update-tour' })
  async updateTourist(
    @Ctx() context: RmqContext,
    @Payload() updateTouristDto: UpdateTouristDTO,
    @Payload() payload: { tourId: string; userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.tourService.updateTour(payload.tourId, payload.userId, { ...updateTouristDto });
  }
  // @MessagePattern({ cmd: 'get-tours' })
  // async getAllTour(@Ctx() context: RmqContext) {
  //   this.sharedService.acknowledgeMessage(context);
  //   return this.tourService.getTours();
  // }
  //-----------seller------------------
  @MessagePattern({ cmd: 'create-store' })
  async createStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
    @Payload() newStoreDTO: NewStoreDTO,
  ) {
    this.sharedService.acknowledgeMessage(context);
    const user = await this.managerService.findUserById(payload.userId);
    return this.sellerService.createStore(newStoreDTO, user);
  }
  @MessagePattern({ cmd: 'get-tour-to-Store' })
  async getTourToStore(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    const getTourOfStore = await this.redisService.get('getTourOfStore');
    if (getTourOfStore) {
      console.log('Cache');
      return getTourOfStore;
    }
    const tour = await this.sellerService.getTourEachStore(payload.userId);
    await this.redisService.set('getTourOfStore', tour);
    return tour;
  }
  @MessagePattern({ cmd: 'bill-store' })
  @UseInterceptors(CacheInterceptor)
  async getTourHello(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: string },
  ) {
    this.sharedService.acknowledgeMessage(context);
    // const hello = await this.redisService.get('hello');
    // if (hello) {
    //   console.log('Cache');
    //   return hello;
    // }
    // const h = this.managerService.getHello();
    // await this.redisService.set('hello', h);

    return await this.sellerService.getTrackUserRegisteredTour(payload.userId);
  }
}
