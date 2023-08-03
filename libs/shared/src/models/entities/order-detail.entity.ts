import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderEntity, TourEntity } from '@app/shared';
import { PassengerEntity } from '@app/shared/models/entities/passenger.entity';

@Entity('order detail')
export class OrderDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  adultPassengers: number;

  @Column({ default: 0 })
  childPassengers: number;

  @Column({ default: 0 })
  toddlerPassengers: number;

  @Column({ default: 0 })
  infantPassengers: number;

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

  @OneToMany(() => PassengerEntity, (passenger) => passenger.orderDetail)
  passengers: PassengerEntity[];
}
