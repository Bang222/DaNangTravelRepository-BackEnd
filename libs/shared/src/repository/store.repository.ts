import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@app/shared';
import { StoreEntity } from '@app/shared/models/entities/store.entity';
import { StoreRepositoryInterface } from '@app/shared/interfaces/store.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
