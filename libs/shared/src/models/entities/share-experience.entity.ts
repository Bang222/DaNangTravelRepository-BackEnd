import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CommentEntity, UserEntity } from '@app/shared';
import { ReviewStatus } from '@app/shared/models/enum';

@Entity('used-tour-review')
export class ShareExperienceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  anonymous: boolean;

  @Column({ default: '{0}', nullable: true, type: 'text', array: true })
  upVote: string[];

  @Column({ type: 'enum', enum: ReviewStatus, default: ReviewStatus.NOTYET })
  status: ReviewStatus;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @OneToMany(() => CommentEntity, (comments) => comments.experience)
  comments: CommentEntity[];
}
