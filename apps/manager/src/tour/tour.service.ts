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
import { CartDto, NewTouristDTO } from './dtos';
import { AuthServiceInterface } from '../../../auth/src/interface/auth.service.interface';

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
    private readonly UsedTourReviewRepository: UsedTourReviewRepositoryInterface,
    @Inject('UserRegisteredTourRepositoryInterface')
    private readonly UserRegisteredTourRepository: UserRegisteredTourRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
  ) {}
  async tourHello(id: number) {
    console.log(id);
    return 'tourHello';
  }
  async getAllTours(): Promise<TourEntity[]> {
    return await this.tourRepository.findAll();
  }
  async createTour(
    newTour: Readonly<NewTouristDTO>,
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
      } = newTour;
      if (quantity * price === 0 && startDate <= new Date(Date.now())) {
        throw new Error('you can not create Tour');
      }
      return this.tourRepository.save({
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
        where: [{ tour: { id: cartDto.tourId }, user: { id: user.id } }],
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
          quantity: +cartFromDb.quantity + +cartDto.quantity,
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  async checkout(user: Readonly<UserEntity>) {
    try {
      const cartDetailOfUser = await this.findCartDetailsByUser(user);
      for (const itemOfCart of cartDetailOfUser) {
        // check Quantity cart And Tour
        if (itemOfCart.quantity >= itemOfCart.tour.quantity) {
          throw new Error('Not enough slot for this tour ');
        }
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
        await this.orderDetailRepository.create({
          quantity: itemOfCart.quantity,
          tour: itemOfCart.tour,
          order: CreateOrderUser,
        });
        const findTourById = await this.findOneByTourId(itemOfCart.tour.id);
        await this.tourRepository.save({
          ...findTourById,
          quantity: +findTourById.quantity - +itemOfCart.quantity,
        });
        const createUserRegisterTour =
          await this.UserRegisteredTourRepository.create({
            tour: itemOfCart.tour,
          });
        await this.usersRepository.save({
          ...user,
          userRegisteredTour: createUserRegisterTour,
        });
        await this.UsedTourReviewRepository.create({
          user: user,
          tour: itemOfCart.tour,
        });
        await this.cartRepository.remove({ ...itemOfCart });
      }
      return cartDetailOfUser;
    } catch (e) {
      throw new Error(e);
    }
  }
}
