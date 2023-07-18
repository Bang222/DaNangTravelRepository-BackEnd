import { Inject, Injectable } from '@nestjs/common';
import {
  StoreEntity,
  StoreRepositoryInterface,
  UserEntity,
  UsersRepositoryInterface,
} from '@app/shared';
import { NewStoreDTO } from './dto';
import { Role } from '@app/shared/models/enum';

@Injectable()
export class SellerService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UsersRepositoryInterface,
  ) {}
  async findAllStore() {
    return await this.storeRepository.findWithRelations({
      relations: ['user'],
    });
  }
  async findOwnerIdOfAllStore() {
    return (
      await this.storeRepository.findWithRelations({ relations: ['user'] })
    ).map((item) => {
      return item.user?.id;
    });
  }
  async findOwnerIdByUserId(userId: string) {
    return await this.userRepository.findByCondition({
      where: { id: userId },
      relations: { store: true },
    });
  }
  async findOneStoreById(userId: string): Promise<StoreEntity> {
    const userDetails = await this.findOwnerIdByUserId(userId);
    return await this.storeRepository.findOneById(userDetails.store?.id);
  }
  async createStore(
    newStoreDTO: NewStoreDTO,
    user: Readonly<UserEntity>,
  ): Promise<StoreEntity> {
    const { name, slogan } = newStoreDTO;
    const userExistsStore = await this.findOwnerIdOfAllStore();
    if (userExistsStore.includes(user.id)) {
      throw new Error('You have store');
    }
    await this.userRepository.save({
      ...user,
      role: Role.SELLER,
    });
    return await this.storeRepository.save({ name, slogan, user });
  }
  async getTourEachStore(userId: string): Promise<StoreEntity> {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: ['tours'],
    });
  }
}
