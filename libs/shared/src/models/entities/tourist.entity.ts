import {
  Column,
  CreateDateColumn,
  Entity,
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
  ShareExperienceEntity,
  UserRegisteredTourEntity,
} from '@app/shared';

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

  @Column({ nullable: true })
  imageUrl: string;

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

  @OneToMany(() => CartEntity, (carts) => carts.tour)
  carts: CartEntity[];

  @OneToMany(() => OrderDetailEntity, (orderDetails) => orderDetails.tour)
  orderDetails: OrderDetailEntity[];

  @OneToOne(
    () => UserRegisteredTourEntity,
    (userRegisteredTour) => userRegisteredTour.tour,
  )
  userRegisteredTour: UserRegisteredTourEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.tourist)
  comments: CommentEntity[];
}
