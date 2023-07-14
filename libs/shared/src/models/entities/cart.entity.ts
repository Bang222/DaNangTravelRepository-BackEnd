import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TourEntity, UserEntity } from '@app/shared';

@Entity('cart')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: false;

  @ManyToOne(() => UserEntity, (user) => user.carts)
  user: UserEntity;

  @ManyToOne(() => TourEntity, (tour) => tour.carts)
  tour: TourEntity;
}
