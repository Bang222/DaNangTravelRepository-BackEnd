import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  OrderEntity,
  OrderRepositoryInterface,
} from '@app/shared';

@Injectable()
export class OrderRepository
  extends BaseAbstractRepository<OrderEntity>
  implements OrderRepositoryInterface
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {
    super(orderRepository);
  }
}
