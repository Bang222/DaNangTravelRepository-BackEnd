import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderEntity, TourEntity } from '@app/shared';
import { PaymentStatus } from '@app/shared/models/enum';

@Entity('order detail')
export class OrderDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ default: 0 })
  adultPassengers: number;

  @Column({ default: 0 })
  childPassengers: number;

  @Column({ default: 0 })
  toddlerPassengers: number;

  @Column({ default: 0 })
  infantPassengers: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @OneToOne(() => OrderEntity, (order) => order.orderDetail)
  @JoinTable({ name: 'orderId' })
  order: OrderEntity;
  @Column()
  orderId: string;

  @ManyToOne(() => TourEntity, (tour) => tour.orderDetails)
  @JoinColumn({ name: 'tourId' })
  tour: TourEntity;
  @Column()
  tourId: string;
}
