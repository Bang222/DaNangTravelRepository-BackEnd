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

import { TourStatus } from '@app/shared/models/enum';
import {
  CartEntity,
  CommentEntity,
  OrderDetailEntity,
  StoreEntity,
} from '@app/shared';
import { ScheduleEntity } from '@app/shared/models/entities/schedule.entity';

@Entity('tour')
export class TourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  address: string;

  @Column()
  startAddress: string;

  @Column()
  endingAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: TourStatus, default: TourStatus.AVAILABLE })
  status: TourStatus;

  @Column()
  quantity: number;

  @Column()
  baseQuantity: number;

  @Column('text', { nullable: true, array: true, default: [] })
  imageUrl: string[];

  @Column({ default: '{0}', nullable: true, type: 'text', array: true })
  upVote: string[];

  @CreateDateColumn()
  lastRegisterDate: Date;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @ManyToOne(() => StoreEntity, (store) => store.tours)
  store: StoreEntity;
  @JoinColumn({ name: 'storeId' })
  @Column({ nullable: true })
  storeId: string;

  @OneToMany(() => CartEntity, (carts) => carts.tour)
  carts: CartEntity[];

  @OneToMany(() => OrderDetailEntity, (orderDetails) => orderDetails.tour)
  orderDetails: OrderDetailEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.tourist)
  comments: CommentEntity[];

  @OneToMany(() => ScheduleEntity, (schedule) => schedule.tour)
  schedules: ScheduleEntity[];
}
