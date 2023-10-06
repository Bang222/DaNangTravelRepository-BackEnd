import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentRepositoryInterface,
  StoreRepositoryInterface,
  TourRepositoryInterface,
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
  ) {}

  async confirmedPayment(storeId: string, month: Date) {
    const currentDay = new Date();
    return await this.paymentRepository.save({
      isPaymentConfirmed: true,
      storeId: storeId,
      // month: new Date(month),
    });
  }
  async getAllStore(page: number, month: number): Promise<any> {
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
      const storesWithTotalPrice = dataTotalIncomeTrackingMonth.map((store) => {
        const totalOrderPrice = store.orders.reduce(
          (total, order) => total + order.totalPrice,
          0,
        );
        return { ...store, totalOrderPrice };
      });
      return storesWithTotalPrice;
    } catch (e) {
      return e;
    }
  }
}
