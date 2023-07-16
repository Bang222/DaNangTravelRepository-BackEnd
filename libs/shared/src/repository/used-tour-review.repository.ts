import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  UsedTourReviewEntity,
  UsedTourReviewRepositoryInterface,
} from '@app/shared';

@Injectable()
export class UsedTourReviewRepository
  extends BaseAbstractRepository<UsedTourReviewEntity>
  implements UsedTourReviewRepositoryInterface
{
  constructor(
    @InjectRepository(UsedTourReviewEntity)
    public readonly userTourReviewRepository: Repository<UsedTourReviewEntity>,
  ) {
    super(userTourReviewRepository);
  }
}
