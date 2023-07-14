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
import { StoreEntity } from '@app/shared/models/entities/store.entity';
import { CartEntity } from '@app/shared/models/entities/cart.entity';
import { OrderDetailEntity } from '@app/shared/models/entities/order-detail.entity';
import { UserRegisteredTourEntity } from '@app/shared/models/entities/user-registered-tour.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: TourStatus, default: TourStatus.ACTIVE })
  status: TourStatus;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  imageUrl: string;

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
}
