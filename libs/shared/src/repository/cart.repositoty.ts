import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  CartEntity,
  CartRepositoryInterface,
} from '@app/shared';

@Injectable()
export class CartRepository
  extends BaseAbstractRepository<CartEntity>
  implements CartRepositoryInterface
{
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartEntity: Repository<CartEntity>,
  ) {
    super(cartEntity);
  }
}
