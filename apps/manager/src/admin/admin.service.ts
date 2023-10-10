import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  OrderRepositoryInterface,
  PaymentEntity,
  PaymentRepositoryInterface,
  StoreRepositoryInterface,
  TourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';

import { Between } from 'typeorm';
import { StoreStatus } from '@app/shared/models/enum';

@Injectable()
export class AdminService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('OrderRepositoryInterface')
    private readonly orderRepository: OrderRepositoryInterface,
  ) {}
  async unBanStore(storeId: string) {
    try {
      const findStore = await this.storeRepository.findOneById(storeId);
      if (!findStore) throw new BadRequestException('Can not found store');
      return await this.storeRepository.save({
        ...findStore,
        isActive: StoreStatus.ACTIVE,
      });
    } catch (e) {
      return e;
    }
  }
  async banStore(storeId: string) {
    try {
      const findStore = await this.storeRepository.findOneById(storeId);
      if (!findStore) throw new BadRequestException('Can not found store');
      return await this.storeRepository.save({
        ...findStore,
        isActive: StoreStatus.CLOSE,
      });
    } catch (e) {
      return e;
    }
  }
  async banUser(userId: string) {
    try {
      const findUser = await this.usersRepository.findOneById(userId);
      if (!findUser) throw new BadRequestException('Can not found User');
      return await this.usersRepository.save({
        ...findUser,
        isActive: false,
      });
    } catch (e) {
      return e;
    }
  }
  async unBanUser(userId: string) {
    try {
      const findUser = await this.usersRepository.findOneById(userId);
      if (!findUser) throw new BadRequestException('Can not found User');
      return await this.usersRepository.save({
        ...findUser,
        isActive: true,
      });
    } catch (e) {
      return e;
    }
  }
  async confirmedPayment(
    storeId: string,
    month: number,
  ): Promise<PaymentEntity> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
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
    try {
      const ordersInAMonth = await this.orderRepository.findWithRelations({
        where: {
          storeId: storeId,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
      });
      const findStoreById = await this.storeRepository.findByCondition({
        where: { id: storeId },
      });
      const TotalIncomeInAMonth = ordersInAMonth.reduce((sum, order) => {
        return sum + (order.totalPrice || 0); // Use 0 if totalPrice is undefined or null
      }, 0);
      const result = Number((TotalIncomeInAMonth * 0.17).toFixed(2));
      const existingPayment = await this.paymentRepository.findByCondition({
        where: {
          storeId: storeId,
          month: month,
          year: currentYear,
        },
      });

      if (existingPayment) {
        throw new BadRequestException('Store Paid');
      }
      await this.storeRepository.save({
        ...findStoreById,
        paidMonth: [...findStoreById.paidMonth, Number(month)],
      });
      const newPayment = this.paymentRepository.create({
        isPaymentConfirmed: true,
        storeId: storeId,
        totalProfit: result,
        month: month,
        year: currentYear,
      });
      await this.paymentRepository.save(await newPayment);
      return newPayment;
    } catch (e) {
      return e;
    }
  }
  async getAllStore(page: number, month: number) {
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
    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;
    const countStore = await this.storeRepository.count();
    const stores = await this.storeRepository.findWithRelations({
      skip: skip,
      take: itemsPerPage,
      order: { createdAt: 'DESC' },
      relations: { orders: true, user: true },
      select: {
        orders: {
          id: true,
          totalPrice: true,
        },
        user: {
          email: true,
        },
      },
    });
    const newDataStore = [];
    for (const store of stores) {
      const findOrderStore = await this.orderRepository.findAll({
        where: {
          storeId: store.id,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
      });
      const totalIncome = findOrderStore.reduce(
        (acc, cur) => acc + cur.totalPrice,
        0,
      );
      newDataStore.push({ ...store, totalIncome });
    }
    return { data: newDataStore, totalStore: countStore };
  }
  async getAllUsers(page: number) {
    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;
    const countUser = await this.usersRepository.count();
    const data = await this.usersRepository.findWithRelations({
      skip: skip,
      take: itemsPerPage,
      order: { createdTime: 'DESC' },
    });
    return { data, totalUser: countUser };
  }

  async getProfit(page: number, month: number): Promise<any> {
    try {
      const itemsPerPage = 10;
      const skip = (page - 1) * itemsPerPage;
      const currentDate = new Date();
      // currentDate.setMonth(month - 1);
      // const firstDayOfMonth = new Date(
      //   currentDate.getFullYear(),
      //   currentDate.getMonth(),
      //   1,
      // );
      // const lastDayOfMonth = new Date(
      //   currentDate.getFullYear(),
      //   currentDate.getMonth() + 1,
      //   0,
      // );
      // const totalPage = await this.paymentRepository.count({
      //   where: { month: month, year: currentDate.getFullYear() },
      // });
      const dataTotalIncomeTrackingMonth =
        await this.storeRepository.findWithRelations({
          skip: skip,
          take: itemsPerPage,
          order: { createdAt: 'DESC' },
          relations: { payments: true, user: true },
          where: {
            payments: {
              year: currentDate.getFullYear(),
              month: month,
            },
          },
          select: {
            user: {
              email: true,
            },
          },
        });
      return {
        data: dataTotalIncomeTrackingMonth,
        totalData: dataTotalIncomeTrackingMonth.length,
      };
    } catch (e) {
      return e;
    }
  }
}
