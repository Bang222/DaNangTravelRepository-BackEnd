import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TourEntity,
  BaseAbstractRepository,
  TourRepositoryInterface,
} from '@app/shared';

@Injectable()
export class TourRepository
  extends BaseAbstractRepository<TourEntity>
  implements TourRepositoryInterface
{
  constructor(
    @InjectRepository(TourEntity)
    private readonly TourRepository: Repository<TourEntity>,
  ) {
    super(TourRepository);
  }
}
