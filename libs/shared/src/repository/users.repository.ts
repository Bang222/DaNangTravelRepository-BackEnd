import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  UserEntity,
  UsersRepositoryInterface,
} from '@app/shared';
@Injectable()
export class UsersRepository
  extends BaseAbstractRepository<UserEntity>
  implements UsersRepositoryInterface
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly UsersRepository: Repository<UserEntity>,
  ) {
    super(UsersRepository);
  }
}
