import { Inject, Injectable } from '@nestjs/common';
import { StoreEntity, StoreRepositoryInterface } from '@app/shared';

@Injectable()
export class AdminService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
  ) {}

  async getAllStore(page: number): Promise<StoreEntity[]> {
    try {
      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;
      const getAllStore = await this.storeRepository.findWithRelations({
        skip: skip,
        take: itemsPerPage,
        order: { createdAt: 'DESC' },
      });
      return getAllStore;
    } catch (e) {
      return e;
    }
  }
}
