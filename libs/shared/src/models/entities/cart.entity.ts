import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourEntity, UserEntity } from '@app/shared';

@Entity('cart')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: true })
  isActive: boolean;

  @Column()
  quantity: number;

  @CreateDateColumn({ nullable: true })
  CreateAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  user: UserEntity;

  @ManyToOne(() => TourEntity, (tour) => tour.carts)
  tour: TourEntity;
}
