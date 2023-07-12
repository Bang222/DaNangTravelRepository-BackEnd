import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@app/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourEntity } from '@app/shared/models/entities/tourist.entity';
import { TourRepositoryInterface } from '@app/shared/interfaces/tour.repository.interface';

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
