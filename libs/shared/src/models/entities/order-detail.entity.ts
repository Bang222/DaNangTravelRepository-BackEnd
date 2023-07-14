import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderEntity, TourEntity } from '@app/shared';

@Entity('order-detail')
export class OrderDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => OrderEntity, (order) => order.orderDetails)
  @JoinTable()
  order: OrderEntity;

  @ManyToOne(() => TourEntity, (tour) => tour.orderDetails)
  @JoinTable()
  tour: TourEntity;
}
