import { Inject, Injectable } from '@nestjs/common';
import {CartRepositoryInterface, TourEntity, TourRepositoryInterface, UserEntity} from '@app/shared';
import {CartDto, NewTouristDTO} from './dtos';

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
  async findByTourId(tourId: string) {
    return await this.tourRepository.findOneById(tourId);
  }
  async getAllTours(): Promise<TourEntity[]> {
    return await this.tourRepository.findAll();
  }
  async createTour(
    newTour: Readonly<NewTouristDTO>,
    storeOfUserOwner,
  ): Promise<TourEntity> {
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
    const savedTour = this.tourRepository.save({
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
    return savedTour;
  }

  async createCart(cartDto: CartDto, user: Readonly<UserEntity>) {
    try {
      const tour = await this.findByTourId(cartDto.tourId);
      const cartFromDb = await this.cartRepository.findByCondition({
        where: [{ user: user },{ tour: tour }],
        relations: { tour: true },
      });
      if (!cartFromDb) {
        return await this.cartRepository.save({
          user,
          tour,
          quantity: +cartDto.quantity,
        });
      } else {
        const findCart = await this.cartRepository.findByCondition({
          where: [{ user: user }, { tour: tour }],
          relations: { tour: true },
        });
        return await this.cartRepository.save({
          ...findCart,
          quantity: +findCart.quantity + +cartDto.quantity,
        });
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}
