import {Inject, Injectable} from '@nestjs/common';
import {
  CartEntity,
  CartRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderRepositoryInterface,
  TourEntity,
  TourRepositoryInterface,
  UsedTourReviewRepositoryInterface,
  UserEntity,
  UserRegisteredTourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';
import {BookingTourDto, CartDto, NewTouristDTO, UpdateTouristDTO,} from './dtos';
import {AuthServiceInterface} from '../../../auth/src/interface/auth.service.interface';
import {TourStatus} from '@app/shared/models/enum';
import {SellerService} from '../seller/seller.service';

@Injectable()
export class TourService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
    @Inject('UsedTourReviewRepositoryInterface')
    private readonly usedTourReviewRepository: UsedTourReviewRepositoryInterface,
    @Inject('UserRegisteredTourRepositoryInterface')
    private readonly userRegisteredTourRepository: UserRegisteredTourRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
    private readonly sellerService: SellerService,
  ) {}
  async tourHello(id: number) {
    console.log(id);
    return 'tourHello';
  }
  async getAllTours(): Promise<TourEntity[]> {
    return await this.tourRepository.findAll({
      order: { createdAt: 'DESC' },
      cache: true,
    });
  }
  async findTourOfUserRegistered(tourId: string) {
    return await this.userRegisteredTourRepository.findOneById(tourId);
  }
  async createTour(
    newTourDTO: Readonly<NewTouristDTO>,
    storeOfUserOwner,
  ): Promise<TourEntity> {
    try {
      if (
        newTourDTO.quantity * newTourDTO.price === 0 &&
        newTourDTO.startDate >= new Date(Date.now())
      ) {
        throw new Error('you can not create Tour');
      }
      const newTour = await this.tourRepository.save({
        ...newTourDTO,
        store: storeOfUserOwner,
      });
      const findNewTour = await this.tourRepository.findOneById(newTour.id);
      await this.userRegisteredTourRepository.save({
        tourId: findNewTour.id,
      });
      return newTour;
    } catch (e) {
      throw new Error(e);
    }
  }

  async updateTour(
    tourId: string,
    userId: string,
    updateTouristDto: UpdateTouristDTO,
  ): Promise<TourEntity> {
    try {
      const findTourNeedUpdate = await this.findOneByTourId(tourId);
      if (!findTourNeedUpdate) {
        throw new Error('Tour Not Exists');
      }
      const checkTourOfStore = await this.sellerService.getTourEachStore(
        userId,
      );
      if (!checkTourOfStore.tours.includes(findTourNeedUpdate)) {
        throw new Error('You not A Store owner');
      }
      const updateTour = await this.tourRepository.save({
        ...findTourNeedUpdate,
        ...updateTouristDto,
      });
      return updateTour;
    } catch (e) {
      throw new Error(e);
    }
  }
  async findCartDetailsByUser(user: Readonly<UserEntity>) {
    return await this.cartRepository.findByCondition({
      relations: { user: true, tour: true },
    });
  }
  async findOneByTourId(id: string): Promise<TourEntity> {
    return await this.tourRepository.findOneById(id);
  }
  async createCart(
    cartDto: CartDto,
    user: Readonly<UserEntity>,
  ): Promise<CartEntity> {
    try {
      const tour = await this.findOneByTourId(cartDto.tourId);
      const cartFromDb = await this.cartRepository.findByCondition({
        relations: ['tour', 'user'],
        where: [{ tour: { id: cartDto?.tourId }, user: { id: user?.id } }],
      });
      if (!cartFromDb) {
        return await this.cartRepository.save({
          tour: tour,
          user: user,
        });
      } else {
        return await this.cartRepository.save({
          ...cartFromDb,
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  }
  async bookingTour(
    tourId: string,
    userId: string,
    bookingTourDto: BookingTourDto,
  ) {
    try {
      const createOrder = await this.orderRepository.save({ userId: userId });
      const findOrder = await this.orderRepository.findOneById(createOrder.id);
      const findTourById = await this.findOneByTourId(tourId);
      const findUserById = await this.authService.findById(userId);
      const price: number = findTourById.price;
      const createOrderDetail = await this.orderDetailRepository.save({
        ...bookingTourDto,
        orderId: findOrder.id,
        tourId: tourId,
      });
      const {
        adultPassengers,
        childPassengers,
        toddlerPassengers,
        infantPassengers,
      } = createOrderDetail;
      const totalPrice =
        adultPassengers * price +
        childPassengers * price +
        toddlerPassengers * 0.7 * price;

      const quantity =
        adultPassengers +
        childPassengers +
        toddlerPassengers +
        infantPassengers;
      if (findTourById.quantity < quantity) throw new Error('Not Enough slot');
      const updateQuantity = await this.tourRepository.save({
        ...findTourById,
        quantity: +findTourById.quantity - Number(quantity),
      });
      if (updateQuantity.quantity < 1) {
        await this.tourRepository.save({
          ...updateQuantity,
          status: TourStatus.FULL,
        });
      }
      await this.orderRepository.save({
        ...findOrder,
        totalPrice: totalPrice,
        orderDetailId: createOrderDetail.id,
      });
      await this.usedTourReviewRepository.save({ userId, tourId });
      const findUserRegisteredTour =
        await this.userRegisteredTourRepository.findByCondition({
          where: { tourId },
          relations: { users: true },
        });
      if (!findUserRegisteredTour.users.includes(findUserById)) {
        await this.userRegisteredTourRepository.save({
          users: [...findUserRegisteredTour.users, findUserById],
        });
      }
      const findTourInCart = await this.cartRepository.findByCondition({
        where: { tourId },
      });
      if (findTourInCart) {
        await this.cartRepository.remove({ ...findTourInCart });
      }
      return 'booking success';
    } catch (e) {
      throw new Error(e);
    }
  }
}
