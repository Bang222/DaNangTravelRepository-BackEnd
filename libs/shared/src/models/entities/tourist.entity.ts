import {
  AfterInsert,
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
  UserRegisteredTourEntity,
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

  @Column('text', { array: true, default: [] })
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

  @OneToMany(() => ScheduleEntity, (schedule) => schedule.tour)
  schedules: ScheduleEntity[];

  // @AfterInsert()
  // async queueTaskAfterInsert() {
  //   // Here, you can queue the task using the Queue instance you injected in the service
  //   await this.queue.add('find-all', this); // Assuming you have a Bull queue named 'process_task'
  // }
}
