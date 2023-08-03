import { Inject, Injectable } from '@nestjs/common';
import { UsersRepositoryInterface } from '@app/shared';

@Injectable()
export class ManagerService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
  ) {}
  typeOf(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
  }
  async findUserById(userId: string) {
    return await this.usersRepository.findOneById(userId);
  }
}
