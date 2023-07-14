import {
  Column, CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourEntity, UserEntity } from '@app/shared';

@Entity('cart')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: false;

  @Column()
  quantity: number;

  @CreateDateColumn()
  CreateAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  @JoinTable()
  user: UserEntity;

  @ManyToOne(() => TourEntity, (tour) => tour.carts)
  tour: TourEntity;
}
