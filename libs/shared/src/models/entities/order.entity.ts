import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderDetailEntity, StoreEntity, UserEntity } from '@app/shared';
import { PaymentEntity } from '@app/shared/models/entities/payment.entity';

@Entity('order')
export class OrderEntity {
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

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  participants: number; // Number of participants in the booking

  @Column({ nullable: true })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID50%', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string; // Booking status

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;
  @Column()
  storeId: string;

  @OneToOne(() => OrderDetailEntity, (orderDetail) => orderDetail.order)
  @JoinColumn({ name: 'orderDetailId' })
  orderDetail: OrderDetailEntity;
  @Column({ nullable: true })
  orderDetailId: string;

  @OneToMany(() => PaymentEntity, (payment) => payment.order)
  payments: PaymentEntity[];
}
