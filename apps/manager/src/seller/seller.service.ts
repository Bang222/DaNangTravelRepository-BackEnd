import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CartRepositoryInterface,
  KeyTokenRepositoryInterface,
  OrderDetailRepositoryInterface,
  OrderEntity,
  OrderRepositoryInterface,
  ShareExperienceRepositoryInterface,
  StoreEntity,
  StoreRepositoryInterface,
  TourRepositoryInterface,
  UserEntity,
  UserRegisteredTourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';
import { DataEachMonthDashBoardDTO, NewStoreDTO } from './dto';
import { Role } from '@app/shared/models/enum';
import { Between } from 'typeorm';

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
    @Inject('ShareExperienceRepositoryInterface')
    private readonly usedTourReviewRepository: ShareExperienceRepositoryInterface,
    @Inject('UserRegisteredTourRepositoryInterface')
    private readonly userRegisteredTourRepository: UserRegisteredTourRepositoryInterface,
    @Inject('OrderDetailRepositoryInterface')
    private readonly orderDetailRepository: OrderDetailRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
    @Inject('KeyTokenRepositoryInterface')
    private readonly keyTokenRepository: KeyTokenRepositoryInterface,
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
    try {
      const userExistsStore = await this.findOwnerIdOfAllStore();
      if (userExistsStore.includes(user.id)) {
        throw new Error('You have store');
      }
      await this.usersRepository.save({
        ...user,
        role: Role.SELLER,
      });
      const findKey = await this.keyTokenRepository.findByCondition({
        where: { userId: user.id },
      });
      await this.keyTokenRepository.remove(findKey);
      return await this.storeRepository.save({ name, slogan, user });
    } catch (e) {
      return e;
    }
  }

  async getTourEachStore(userId: string): Promise<StoreEntity> {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: {
        tours: {
          comments: true,
          schedules: true,
          orderDetails: { passengers: true },
        },
      },
    });
  }

  async getAllTourOfStore(userId: string) {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    const store = await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: {
        tours: {
          comments: true,
          schedules: true,
          orderDetails: { passengers: true, order: true },
        },
      },
    });
    return store.tours.reverse();
  }

  // pageCurrent: number
  async getTourOfStorePage(userId: string, currentPage: number) {
    const itemsPerPage = 10;
    const skip = (currentPage - 1) * itemsPerPage;
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    const totalPage = (
      await this.tourRepository.findAll({
        where: { storeId: OwnerDetail.store.id },
      })
    ).length;
    const findTourToStore = await this.tourRepository.findWithRelations({
      where: { storeId: OwnerDetail.store.id },
      order: { createdAt: 'DESC' },
      relations: {
        comments: true,
        schedules: true,
        orderDetails: { passengers: true, order: true },
      },
      skip: skip,
      take: itemsPerPage,
    });
    return { findTourToStore: findTourToStore, pages: totalPage };
  }

  async findTourOfStore(userId: string) {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail) return null;
    const store = await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: { tours: true },
    });
    return store.tours;
  }

  async trackUserRegistered(userId: string): Promise<StoreEntity> {
    const OwnerDetail = await this.findOwnerIdByUserId(userId);
    if (!OwnerDetail.store) return;
    return await this.storeRepository.findByCondition({
      where: { id: OwnerDetail.store?.id },
      relations: { tours: { userRegisteredTour: { users: true } } },
    });
  }

  async getUserRegisteredTour(tourId: string) {
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

  async getBillOfStore(
    userId: string,
    page: number,
  ): Promise<{ orders: OrderEntity[]; totalPages: number }> {
    try {
      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;
      const findStoreById = await this.storeRepository.findByCondition({
        where: { userId: userId },
      });
      if (!findStoreById) throw new BadRequestException('Can not find Store');
      const takeTotalPages = await this.orderRepository.count({
        where: { storeId: findStoreById.id },
      });
      const orders = await this.orderRepository.findWithRelations({
        where: { storeId: findStoreById.id },
        relations: { orderDetail: { tour: true, passengers: true } },
        order: { createdAt: 'DESC' },
        skip: skip,
        take: itemsPerPage,
      });
      return { orders: orders, totalPages: takeTotalPages };
    } catch (e) {
      return e;
    }
  }

  async getBillOfUser(userId: string) {
    try {
      const findUser = await this.usersRepository.findByCondition({
        where: { id: userId },
        relations: { orders: { orderDetail: { tour: true } } },
      });
      if (!findUser) return null;
      return findUser.orders;
    } catch (e) {
      return e;
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

  async getStatisticalDataDashBoard(
    userId: string,
    month: number,
  ): Promise<{
    totalIncome: number;
    totalPassengers: number;
    totalTours: number;
    totalOrder: number;
    totalLike: number;
    totalComments: number;
    totalAdults: number;
    totalChildren: number;
    totalToddler: number;
    totalInfants: number;
    totalMen: number;
    totalWomen: number;
  }> {
    try {
      const findStoreByUserId = await this.storeRepository.findByCondition({
        where: { userId: userId },
        select: ['id'],
      });
      const currentDate = new Date();
      currentDate.setMonth(month - 1);

      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );
      const findTourById = await this.tourRepository.findAll({
        where: {
          storeId: findStoreByUserId.id,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
        relations: { orderDetails: { passengers: true }, comments: true },
      });
      const findOrderStore = await this.orderRepository.findAll({
        where: {
          storeId: findStoreByUserId.id,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
        relations: { orderDetail: { passengers: true } },
      });

      const totalIncome = findOrderStore.reduce(
        (acc, cur) => acc + cur.totalPrice,
        0,
      );

      const totalPassengers = findOrderStore.reduce(
        (acc, cur) => cur.participants + acc,
        0,
      );

      const totalTours = findTourById.length;
      const totalOrder = findOrderStore.length;
      const totalLike = findTourById.reduce(
        (acc, cur) => acc + cur.upVote.length - 1,
        0,
      );
      const totalComments = findTourById.reduce(
        (acc, cur) => acc + cur.comments.length,
        0,
      );

      const totalAdults = findOrderStore.reduce(
        (acc, cur) => acc + cur.orderDetail.adultPassengers,
        0,
      );
      const totalChildren = findOrderStore.reduce(
        (acc, cur) => acc + cur.orderDetail.childPassengers,
        0,
      );
      const totalToddler = findOrderStore.reduce(
        (acc, cur) => acc + cur.orderDetail.toddlerPassengers,
        0,
      );
      const totalInfants = findOrderStore.reduce(
        (acc, cur) => acc + cur.orderDetail.infantPassengers,
        0,
      );
      const totalMen = findOrderStore.reduce(
        (acc, cur) =>
          acc +
          cur.orderDetail.passengers.filter((item) => item.sex === 'Men')
            .length,
        0,
      );
      const totalWomen = findOrderStore.reduce(
        (acc, cur) =>
          acc +
          cur.orderDetail.passengers.filter((item) => item.sex === 'Women')
            .length,
        0,
      );
      return {
        totalIncome: totalIncome,
        totalPassengers: totalPassengers,
        totalTours: totalTours,
        totalOrder: totalOrder,
        totalLike: totalLike,
        totalComments: totalComments,
        totalAdults: totalAdults,
        totalChildren: totalChildren,
        totalToddler: totalToddler,
        totalInfants: totalInfants,
        totalMen: totalMen,
        totalWomen: totalWomen,
      };
    } catch (e) {
      return e;
    }
  }
  async getDataIncomeEachMonth(
    userId: string,
  ): Promise<DataEachMonthDashBoardDTO[]> {
    const month: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const findStoreByUserId = await this.storeRepository.findByCondition({
      where: { userId: userId },
      select: ['id'],
    });
    const dataIncomeAMonth = [];
    for (const monthNumber of month) {
      const currentDate = new Date();
      currentDate.setMonth(monthNumber - 1);

      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const findOrderById = await this.orderRepository.findWithRelations({
        where: {
          storeId: findStoreByUserId.id,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
        select: { totalPrice: true },
      });

      const total = findOrderById.reduce((acc, cur) => acc + cur.totalPrice, 0);

      dataIncomeAMonth.push({ totalIncome: total, month: monthNumber });
    }
    return dataIncomeAMonth;
  }
}
