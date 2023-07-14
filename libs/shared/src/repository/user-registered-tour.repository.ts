import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  UserRegisteredTourEntity,
  UserRegisteredTourRepositoryInterface,
} from '@app/shared';

@Injectable()
export class UserRegisteredTourRepository
  extends BaseAbstractRepository<UserRegisteredTourEntity>
  implements UserRegisteredTourRepositoryInterface
{
  constructor(
    @InjectRepository(UserRegisteredTourEntity)
    public readonly userRegisteredTourRepository: Repository<UserRegisteredTourEntity>,
  ) {
    super(userRegisteredTourRepository);
  }
}
