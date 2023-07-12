import { Inject, Injectable } from '@nestjs/common';
import {StoreEntity, StoreRepositoryInterface, TourRepositoryInterface, UserEntity} from '@app/shared';
import { NewStoreDTO } from './dto';

@Injectable()
export class SellerService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
  ) {}
  async createStore(
    newStoreDTO: NewStoreDTO,
    id: string,
  ): Promise<StoreEntity> {
    const { name, slogan } = newStoreDTO;
    console.log(id);
    return await this.storeRepository.save({ name, slogan });
  }
}
