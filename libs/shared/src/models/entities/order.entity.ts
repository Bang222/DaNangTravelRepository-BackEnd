import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderDetailEntity, UserEntity } from '@app/shared';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  totalPrice: number;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @OneToOne(() => OrderDetailEntity, (orderDetail) => orderDetail.order)
  @JoinColumn({ name: 'orderDetailId' })
  orderDetail: OrderDetailEntity;
  @Column({ nullable: true })
  orderDetailId: string;


}
