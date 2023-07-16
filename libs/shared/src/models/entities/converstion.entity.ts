import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageEntity, UserEntity } from '@app/shared';

@Entity('conversation')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];
  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
  messages: MessageEntity[];
  @UpdateDateColumn()
  lastUpdated: Date;
}
