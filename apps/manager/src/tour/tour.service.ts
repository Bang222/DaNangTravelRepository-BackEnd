import { Inject, Injectable } from '@nestjs/common';
import { StoreEntity, TourEntity, TourRepositoryInterface } from '@app/shared';
import { NewTouristDTO } from './dtos';

@Injectable()
export class TourService {
  constructor(
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
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
}
