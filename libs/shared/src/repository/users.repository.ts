import { BaseAbstractRepository } from "@app/shared/repository/base/base.abstract.repository";
import { UserEntity } from "@app/shared/entities/user.entity";
import { UsersRepositoryInterface } from "@app/shared/interfaces/users.repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UsersRepository
  extends BaseAbstractRepository<UserEntity>
  implements UsersRepositoryInterface {
  constructor(@InjectRepository(UserEntity) private readonly UsersRepository: Repository<UserEntity>) {
    super(UsersRepository);
  }
}