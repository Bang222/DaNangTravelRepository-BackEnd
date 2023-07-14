import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  StoreEntity,
  StoreRepositoryInterface,
} from '@app/shared';

@Injectable()
export class StoreRepository
  extends BaseAbstractRepository<StoreEntity>
  implements StoreRepositoryInterface
{
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {
    super(storeRepository);
  }
}
