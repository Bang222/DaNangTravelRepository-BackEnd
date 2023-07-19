import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TourEntity, UserEntity } from '@app/shared';

@Entity('user-registered-trip')
export class UserRegisteredTourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => TourEntity, (tour) => tour.userRegisteredTour)
  @JoinColumn({ name: 'tourId' })
  tour: TourEntity;
  @Column({ nullable: true })
  tourId: string;
  @ManyToMany(() => UserEntity, (users) => users.userRegisteredTours)
  @JoinTable()
  users: UserEntity[];
}
