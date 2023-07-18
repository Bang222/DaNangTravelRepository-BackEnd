import {
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TourEntity, UserEntity } from '@app/shared';

@Entity('user-registered-trip')
export class UserRegisteredTourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => TourEntity, (tour) => tour.userRegisteredTour)
  @JoinColumn()
  tour: TourEntity;

  @ManyToMany(() => UserEntity, (user) => user.userRegisteredTours)
  @JoinTable()
  users: UserEntity[];
}
