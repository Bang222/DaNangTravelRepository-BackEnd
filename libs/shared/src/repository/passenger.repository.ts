import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  PassengerEntity,
  PassengerRepositoryInterface,
} from '@app/shared';

@Injectable()
export class PassengerRepository
  extends BaseAbstractRepository<PassengerEntity>
  implements PassengerRepositoryInterface
{
  constructor(
    @InjectRepository(PassengerEntity)
    private readonly passengerRepository: Repository<PassengerEntity>,
  ) {
    super(passengerRepository);
  }
}
