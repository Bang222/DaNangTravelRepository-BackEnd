import {
  Column,
  Entity, JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourEntity, UserEntity } from '@app/shared';
import {Role, StoreStatus} from "@app/shared/models/enum";

@Entity('store')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slogan: string;

  @Column({ type: 'enum', enum: StoreStatus, default: StoreStatus.ACTIVE })
  isActive: StoreStatus;

  @OneToOne(() => UserEntity, (user) => user.store) // specify inverse side as a second parameter
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => TourEntity, (tour) => tour.store) // specify inverse side as a second parameter
  tours: TourEntity[];
}
