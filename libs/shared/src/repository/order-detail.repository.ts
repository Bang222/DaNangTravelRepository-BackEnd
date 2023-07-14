import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  OrderDetailEntity,
  OrderDetailRepositoryInterface,
} from '@app/shared';

@Injectable()
export class OrderDetailRepository
  extends BaseAbstractRepository<OrderDetailEntity>
  implements OrderDetailRepositoryInterface
{
  constructor(
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepository: Repository<OrderDetailEntity>,
  ) {
    super(orderDetailRepository);
  }
}
