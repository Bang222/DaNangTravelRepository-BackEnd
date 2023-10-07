import {Inject, Injectable} from '@nestjs/common';
import {PaymentRepositoryInterface, StoreRepositoryInterface, TourRepositoryInterface,} from '@app/shared';
import {Between} from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @Inject('StoreRepositoryInterface')
    private readonly storeRepository: StoreRepositoryInterface,
    @Inject('TourRepositoryInterface')
    private readonly tourRepository: TourRepositoryInterface,
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
  ) {}

  async confirmedPayment(storeId: string, profit: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Check if a payment has already been confirmed for the current month and year
    const existingPayment = await this.paymentRepository.findByCondition({
      where: {
        storeId: storeId,
        isPaymentConfirmed: true,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (existingPayment) {
      return { isPaymentConfirmed: existingPayment.isPaymentConfirmed };
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
          // order: { createdAt: 'DESC' },
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
      return dataTotalIncomeTrackingMonth.map((store) => {
        const totalOrderPrice = store.orders.reduce(
          (total, order) => total + order.totalPrice,
          0,
        );
        return { ...store, totalOrderPrice };
      });
    } catch (e) {
      return e;
    }
  }
}
