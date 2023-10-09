import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  OrderRepositoryInterface,
  PaymentRepositoryInterface,
  StoreRepositoryInterface,
  TourRepositoryInterface,
  UsersRepositoryInterface,
} from '@app/shared';

import { Between } from 'typeorm';

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

  async confirmedPayment(storeId: string, month: number) {
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
      const TotalIncomeInAMonth = ordersInAMonth.reduce((sum, order) => {
        return sum + (order.totalPrice || 0); // Use 0 if totalPrice is undefined or null
      }, 0);
      const result = Number((TotalIncomeInAMonth * 0.17).toFixed(2));
      const existingPayment = await this.paymentRepository.findByCondition({
        where: {
          storeId: storeId,
          isPaymentConfirmed: true,
          totalProfit: result,
          month: month,
          year: currentYear,
        },
      });

      if (existingPayment) {
        return new BadRequestException('Store Paid');
      }
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
  async getAllStore(page: number) {
    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;
    const countStore = await this.storeRepository.count();
    const data = await this.storeRepository.findWithRelations({
      skip: skip,
      take: itemsPerPage,
      order: { createdAt: 'DESC' },
      relations: { orders: true },
    });
    return { data, totalStore: countStore };
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
      const totalPage = await this.paymentRepository.count({
        where: { month: month, year: currentDate.getFullYear() },
      });
      const dataTotalIncomeTrackingMonth =
        await this.storeRepository.findWithRelations({
          skip: skip,
          take: itemsPerPage,
          order: { createdAt: 'DESC' },
          relations: { orders: true, payments: true },
          where: {
            payments: {
              year: currentDate.getFullYear(),
              month: month,
            },
          },
          select: {
            orders: {
              id: true,
              totalPrice: true,
            },
          },
        });
      const data = dataTotalIncomeTrackingMonth.map((store) => {
        const totalOrderPriceAMonth = store.orders.reduce(
          (total, order) => total + order.totalPrice,
          0,
        );
        return { ...store, totalOrderPriceAMonth };
      });
      return { data, totalData: totalPage };
    } catch (e) {
      return e;
    }
  }
}
