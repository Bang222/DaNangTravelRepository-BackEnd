// comment.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TourEntity, UsedTourReviewEntity } from '@app/shared';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => TourEntity, (tourist) => tourist.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'touristId' })
  tourist: TourEntity;
  @Column({ nullable: true })
  touristId: string;

  @ManyToOne(() => UsedTourReviewEntity, (review) => review.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: UsedTourReviewEntity;
  @Column({ nullable: true })
  reviewId: string;
}
