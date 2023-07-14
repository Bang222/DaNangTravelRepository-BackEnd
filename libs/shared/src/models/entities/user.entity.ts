import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '@app/shared/models/enum/role.enum';
import { FriendRequestEntity } from '@app/shared/models/entities/friend-request.entity';
import { ConversationEntity } from '@app/shared/models/entities/converstion.entity';
import { MessageEntity } from '@app/shared/models/entities/message.entity';
import { StoreEntity } from '@app/shared/models/entities/store.entity';
import { CartEntity } from '@app/shared/models/entities/cart.entity';
import { OrderEntity } from '@app/shared/models/entities/order.entity';
import { UserRegisteredTourEntity } from '@app/shared/models/entities/user-registered-tour.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  createdTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailValidated: boolean;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  sex: string;

  @Column({
    default:
      'https://preview.redd.it/rrz3hmsxcll71.png?width=640&crop=smart&auto=webp&s=87cc5ed38d8f088ef9fffef7a4c5756b64309d6a',
  })
  profilePicture: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToOne(() => StoreEntity, (store) => store.user)
  store: StoreEntity;

  @OneToMany(() => CartEntity, (carts) => carts.user)
  carts: CartEntity[];

  @OneToMany(() => OrderEntity, (orders) => orders.user)
  orders: OrderEntity[];

  @ManyToOne(
    () => UserRegisteredTourEntity,
    (userRegisteredTour) => userRegisteredTour.users,
  )
  userRegisteredTour: UserRegisteredTourEntity;

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
