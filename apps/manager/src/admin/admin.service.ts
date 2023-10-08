import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {
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
  ) {}

  async confirmedPayment(storeId: string, profit: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Check if a payment has already been confirmed for the current month and year
    try {
      const existingPayment = await this.paymentRepository.findByCondition({
        where: {
          storeId: storeId,
          isPaymentConfirmed: true,
          totalProfit: profit * 0.17,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingPayment) {
        return new BadRequestException('confirmed');
      }
      const newPayment = this.paymentRepository.create({
        isPaymentConfirmed: true,
        storeId: storeId,
        totalProfit: profit,
        month: currentMonth,
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
    });
    return { data, totalStore: countStore };
  }
  async getAllUsers(page: number) {
    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;
    const countStore = await this.usersRepository.count();
    const data = await this.usersRepository.findWithRelations({
      skip: skip,
      take: itemsPerPage,
      order: { createdTime: 'DESC' },
    });
    return { data, totalUser: countStore };
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

      const dataTotalIncomeTrackingMonth =
        await this.storeRepository.findWithRelations({
          skip: skip,
          take: itemsPerPage,
          order: { createdAt: 'DESC' },
          relations: { orders: true, payments: true },
          where: {
            orders: {
              createdAt: Between(firstDayOfMonth, lastDayOfMonth),
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
      return { data, totalData: dataTotalIncomeTrackingMonth.length };
    } catch (e) {
      return e;
    }
  }
}
