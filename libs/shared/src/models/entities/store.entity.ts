import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  OrderEntity,
  PaymentEntity,
  TourEntity,
  UserEntity,
} from '@app/shared';
import { StoreStatus } from '@app/shared/models/enum';

@Entity('store')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slogan: string;

  @Column('simple-array', { default: 0, nullable: true })
  paidMonth: number[];

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn({ default: new Date() })
  createdAt: Date;

  @Column({
    default:
      'https://preview.redd.it/rrz3hmsxcll71.png?width=640&crop=smart&auto=webp&s=87cc5ed38d8f088ef9fffef7a4c5756b64309d6a',
  })
  imgUrl: string;

  @Column({ type: 'enum', enum: StoreStatus, default: StoreStatus.ACTIVE })
  isActive: StoreStatus;

  @OneToOne(() => UserEntity, (user) => user.store) // specify inverse side as a second parameter
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @OneToMany(() => TourEntity, (tours) => tours.store) // specify inverse side as a second parameter
  tours: TourEntity[];

  @OneToMany(() => OrderEntity, (orders) => orders.store) // specify inverse side as a second parameter
  orders: OrderEntity[];

  @OneToMany(() => PaymentEntity, (payments) => payments.store) // specify inverse side as a second parameter
  payments: PaymentEntity[];
}
