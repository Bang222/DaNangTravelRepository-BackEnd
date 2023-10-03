import {Inject, Injectable} from '@nestjs/common';
import {StoreEntity, StoreRepositoryInterface} from "@app/shared";

@Injectable()
export class AdminService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
  ) {}

  async getAllStore(): Promise<StoreEntity[]> {
    const getAllStore = await this.storeRepository.findAll();
    return getAllStore;
  }
}
