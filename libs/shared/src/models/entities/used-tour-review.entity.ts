import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TourEntity, UserEntity } from '@app/shared';

@Entity('used-tour-review')
export class UsedTourReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  Anonymous: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => TourEntity, (tour) => tour.reviews)
  tour: TourEntity;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  user: UserEntity;
}
