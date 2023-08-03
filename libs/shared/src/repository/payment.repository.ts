import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  PaymentEntity,
  PaymentRepositoryInterface,
} from '@app/shared';

@Injectable()
export class PaymentRepository
  extends BaseAbstractRepository<PaymentEntity>
  implements PaymentRepositoryInterface
{
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {
    super(paymentRepository);
  }
}
