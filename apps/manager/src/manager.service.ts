import { Inject, Injectable } from '@nestjs/common';
import { UsersRepositoryInterface } from '@app/shared';

@Injectable()
export class ManagerService {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
  ) {}
  async findUserById(userId: string) {
    return await this.usersRepository.findOneById(userId);
  }
}
