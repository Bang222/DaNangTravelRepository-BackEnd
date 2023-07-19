import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CommentEntity, TourEntity, UserEntity } from '@app/shared';
import {ReviewStatus, StoreStatus} from "@app/shared/models/enum";

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

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.NOTYET })
  status: ReviewStatus;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => TourEntity, (tour) => tour.reviews)
  @JoinColumn({ name: 'tourId' })
  tour: TourEntity;
  @Column()
  tourId: string;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @OneToMany(() => CommentEntity, (comment) => comment.review)
  comments: CommentEntity[];

}
