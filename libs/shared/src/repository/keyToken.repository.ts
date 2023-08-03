import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  KeyTokenEntity,
  KeyTokenRepositoryInterface,
} from '@app/shared';

@Injectable()
export class KeyTokenRepository
  extends BaseAbstractRepository<KeyTokenEntity>
  implements KeyTokenRepositoryInterface
{
  constructor(
    @InjectRepository(KeyTokenEntity)
    private readonly keyTokenEntityRepository: Repository<KeyTokenEntity>,
  ) {
    super(keyTokenEntityRepository);
  }
}
