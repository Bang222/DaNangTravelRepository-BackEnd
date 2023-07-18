import { Inject, Injectable } from '@nestjs/common';
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
import { CartDto, NewTouristDTO, UpdateTouristDTO } from './dtos';
import { AuthServiceInterface } from '../../../auth/src/interface/auth.service.interface';
import { TourStatus } from '@app/shared/models/enum';
import { SellerService } from '../seller/seller.service';

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
    return await this.tourRepository.findAll();
  }
  async findTourOfUserRegistered(tourId: string) {
    return await this.userRegisteredTourRepository.findOneById(tourId);
  }
  async createTour(
    newTourDTO: Readonly<NewTouristDTO>,
    storeOfUserOwner,
  ): Promise<TourEntity> {
    try {
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
      } = newTourDTO;
      if (quantity * price === 0 && startDate <= new Date(Date.now())) {
        throw new Error('you can not create Tour');
      }
      const newTour = await this.tourRepository.save({
        name,
        description,
        price,
        quantity,
        address,
        imageUrl,
        startDate,
        endDate,
        lastRegisterDate,
        store: storeOfUserOwner,
      });
      const findNewTour = await this.tourRepository.findOneById(newTour.id);
      await this.userRegisteredTourRepository.save({
        tour: findNewTour,
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
    return await this.cartRepository.findWithRelations({
      relations: { tour: true, user: true },
      where: [{ user: user }],
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
          quantity: +cartDto.quantity,
        });
      } else {
        return await this.cartRepository.save({
          ...cartFromDb,
          quantity: +cartDto.quantity,
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async checkout(user: Readonly<UserEntity>) {
    try {
      const cartDetailOfUser = await this.findCartDetailsByUser(user);
      const totalPriceEachTourInCart = cartDetailOfUser.map(
        (item) => +item.quantity * +item.tour.price,
      );
      const sumAllPriceInCart = totalPriceEachTourInCart.reduce(
        (a, b) => a + b,
      );
      const CreateOrderUser = await this.orderRepository.save({
        totalPrice: +sumAllPriceInCart,
        user: user,
      });
      for (const itemOfCart of cartDetailOfUser) {
        if (itemOfCart.quantity > itemOfCart.tour.quantity) {
          throw new Error('Not enough slot for this tour ');
        }
        await this.orderDetailRepository.save({
          quantity: itemOfCart.quantity,
          tour: itemOfCart.tour,
          order: CreateOrderUser,
        });
        const findTour = await this.tourRepository.save({
          ...itemOfCart.tour,
          quantity: +itemOfCart.tour.quantity - +itemOfCart.quantity,
        });
        const findTourToUpdate = await this.findOneByTourId(findTour.id);
        //update Status Of Tour
        if (findTourToUpdate.quantity === 0) {
          await this.tourRepository.save({
            ...findTourToUpdate,
            status: TourStatus.FULL,
          });
        }
        const findUserRegisterTour =
          await this.userRegisteredTourRepository.findByCondition({
            relations: ['users', 'tour'],
            where: { tour: { id: itemOfCart.tour.id } },
          });
        if (!findUserRegisterTour.users.includes(user)) {
          await this.userRegisteredTourRepository.save({
            ...findUserRegisterTour,
            users: [...findUserRegisterTour.users, user],
          });
        }
        await this.usedTourReviewRepository.save({
          user: user,
          tour: itemOfCart.tour,
        });
      }
      await this.cartRepository.removeCondition({ where: [{ user }] });
      return 'check out successes';
    } catch (e) {
      throw new Error(e);
    }
  }
}
