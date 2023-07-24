import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '@app/shared/models/enum/role.enum';

import {
  CartEntity,
  CommentEntity,
  OrderEntity,
  StoreEntity,
  ShareExperienceEntity,
  UserRegisteredTourEntity,
} from '@app/shared';

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

  @OneToMany(() => ShareExperienceEntity, (reviews) => reviews.user)
  reviews: ShareExperienceEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.user)
  comments: CommentEntity[];

  @ManyToMany(
    () => UserRegisteredTourEntity,
    (userRegisteredTours) => userRegisteredTours.users,
  )
  @JoinTable()
  userRegisteredTours: UserRegisteredTourEntity[];
}
