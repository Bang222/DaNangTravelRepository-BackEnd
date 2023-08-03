// payment.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderEntity } from '@app/shared';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (order) => order.payments)
  order: OrderEntity;

  @Column()
  amount: number;

  @Column()
  paymentDate: Date;

  // Other relevant columns, e.g., paymentMethod, transactionId, etc.
}
