import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '@app/shared/models/enum/role.enum';
import { FriendRequestEntity } from '@app/shared/models/entities/friend-request.entity';
import { ConversationEntity } from '@app/shared/models/entities/converstion.entity';
import { MessageEntity } from '@app/shared/models/entities/message.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;
  @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.creator,
  )
  friendRequestCreator: FriendRequestEntity[];
  @OneToMany(
    () => FriendRequestEntity,
    (FriendRequestEntity) => FriendRequestEntity.receiver,
  )
  friendRequestReceiver: FriendRequestEntity[];
  @ManyToMany(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.users,
  )
  conversations: ConversationEntity[];
  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.message)
  messages: MessageEntity[];
}
