// comment.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { TourEntity, ShareExperienceEntity, UserEntity } from '@app/shared';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @ManyToOne(() => TourEntity, (tourist) => tourist.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tourId' })
  tourist: TourEntity;
  @Column({ nullable: true })
  tourId: string;

  @ManyToOne(() => ShareExperienceEntity, (experience) => experience.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experienceId' })
  experience: ShareExperienceEntity;
  @Column({ nullable: true })
  experienceId: string;
}
