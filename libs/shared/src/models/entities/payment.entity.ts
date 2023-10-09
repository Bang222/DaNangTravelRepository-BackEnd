// payment.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StoreEntity } from '@app/shared/models/entities/store.entity';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isPaymentConfirmed: boolean;

  @Column({ nullable: true })
  totalProfit: number;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;
  @Column({ nullable: true })
  month: number;

  @Column({ nullable: true })
  year: number;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;
  @Column()
  storeId: string;
  // Other relevant columns, e.g., paymentMethod, transactionId, etc.
}
