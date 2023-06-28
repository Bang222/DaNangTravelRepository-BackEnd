import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationEntity } from '@app/shared/models/entities/converstion.entity';
import { UserEntity } from '@app/shared';

@Entity('message')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  message: string;
  @OneToMany(() => UserEntity, (userEntity) => userEntity.messages)
  user: UserEntity;
  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  conversation: ConversationEntity;
  @CreateDateColumn()
  createdAt: Date;
}
