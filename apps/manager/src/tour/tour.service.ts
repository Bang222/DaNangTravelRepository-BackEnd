import { Inject, Injectable } from '@nestjs/common';
import {
  CartRepositoryInterface,
  TourEntity,
  TourRepositoryInterface,
  UserEntity,
} from '@app/shared';
import { CartDto, NewTouristDTO } from './dtos';

@Injectable()
export class TourService {
  constructor(
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
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
      where: [{ user: user }],
      relations: { tour: true, user: true },
    });
  }
  async findOneByTourId(id: string): Promise<TourEntity> {
    return await this.tourRepository.findOneById(id);
  }
  async createCart(cartDto: CartDto, user: Readonly<UserEntity>) {
    try {
      const tour = await this.tourRepository.findOneById(cartDto.tourId);
      const cartFromDb = await this.cartRepository.findByCondition({
        relations: ['tour', 'user'],
        where: [{ tour: { id: cartDto.tourId }, user }],
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
    const findCartByUser = await this.findCartDetailsByUser(user);
    return findCartByUser;
  }
}
