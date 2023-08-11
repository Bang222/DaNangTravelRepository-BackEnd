import {
  Column,
  CreateDateColumn,
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
  isActive: boolean;

  @CreateDateColumn({ nullable: true })
  CreateAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  @JoinTable({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @ManyToOne(() => TourEntity, (tour) => tour.carts)
  @JoinTable({ name: 'tourId' })
  tour: TourEntity;
  @Column({ nullable: true })
  tourId: string;
}
