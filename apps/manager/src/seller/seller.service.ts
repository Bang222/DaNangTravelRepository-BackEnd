import { Inject, Injectable } from '@nestjs/common';
import {
  CartRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderRepositoryInterface,
  StoreEntity,
  StoreRepositoryInterface,
  TourRepositoryInterface,
  UsedTourReviewRepositoryInterface,
  UserEntity,
  UserRegisteredTourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';
import { NewStoreDTO } from './dto';
import { Role } from '@app/shared/models/enum';
import { AuthServiceInterface } from '../../../auth/src/interface/auth.service.interface';

@Injectable()
export class SellerService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('CartRepositoryInterface')
    private readonly cartRepository: CartRepositoryInterface,
    @Inject('UsedTourReviewRepositoryInterface')
    private readonly usedTourReviewRepository: UsedTourReviewRepositoryInterface,
    @Inject('UserRegisteredTourRepositoryInterface')
    private readonly userRegisteredTourRepository: UserRegisteredTourRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('AuthServiceInterface')
    private readonly authService: AuthServiceInterface,
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
    return await this.usersRepository.findByCondition({
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
    await this.usersRepository.save({
      ...user,
      role: Role.SELLER,
    });
    return await this.storeRepository.save({ name, slogan, user });
  }
  async getTourEachStore(userId: string): Promise<StoreEntity> {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: { tours: true },
    });
  }
  async trackUserRegistered(userId: string): Promise<StoreEntity> {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail.store) return;
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: { tours: { userRegisteredTour: { users: true } } },
    });
  }
  async selectBillOfStore(userId: string) {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: { tours: { orderDetails: { order: { user: true } } } },
    });
  }
  async getUserRegisteredTour(tourId: string) {
    //oke
    try {
      const UsersRegisterTour =
        await this.userRegisteredTourRepository.findByCondition({
          where: { tour: { id: tourId } },
          relations: { users: true },
        });
      if (!UsersRegisterTour) throw new Error('Can not found tour');
      return UsersRegisterTour;
    } catch (e) {
      throw new Error(e);
    }
  }
  async getBillOfStore(userId: string) {
    try {
      const getTourOfStore = await this.selectBillOfStore(userId);
      if (!getTourOfStore) return null;
      return getTourOfStore.tours;
    } catch (e) {
      throw new Error(e);
    }
  }
  async getBillOfUser(userId: string) {
    try {
      const findUser = await this.usersRepository.findByCondition({
        where: { id: userId },
        relations: { orders: { orderDetail: { tour: true } } },
      });
      if (!findUser) return null;
      return findUser;
    } catch (e) {
      throw new Error(e);
    }
  }
  async getFollowerTripRegisteredUser(userId: string) {
    const getFollowerTrip = await this.usersRepository.findByCondition({
      where: { id: userId },
      relations: { userRegisteredTours: true },
    });
    if (!getFollowerTrip) return null;
    return getFollowerTrip;
  }
  async getTrackUserRegisteredTourStore(userId: string) {
    const findStore = await this.trackUserRegistered(userId);
    if (!findStore) return null;
    return findStore;
  }
}
