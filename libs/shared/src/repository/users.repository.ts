import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseAbstractRepository } from '@app/shared/repository/base/base.abstract.repository';
import { UserEntity } from '@app/shared/models/entities/user.entity';
import { UsersRepositoryInterface } from '@app/shared/interfaces/repository-interface/users.repository.interface';

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
