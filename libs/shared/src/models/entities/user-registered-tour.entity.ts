import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TourEntity, UserEntity } from '@app/shared';

@Entity('user-registered-trip')
export class UserRegisteredTourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => TourEntity, (tour) => tour.userRegisteredTour)
  tour: TourEntity;

  @OneToMany(() => UserEntity, (users) => users.userRegisteredTour)
  users: UserEntity[];
}
