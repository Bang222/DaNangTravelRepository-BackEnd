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

  @CreateDateColumn({ default: new Date() })
  createAt: Date;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  @JoinColumn({ name: 'storeId' })
  store: StoreEntity;
  @Column()
  storeId: string;
  // Other relevant columns, e.g., paymentMethod, transactionId, etc.
}
