// passenger.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TourEntity } from '@app/shared';

@Entity('schedule')
export class ScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  day: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  imgUrl: string;

  @ManyToOne(() => TourEntity, (tour) => tour.schedules)
  @JoinColumn({ name: 'tourId' })
  tour: TourEntity;
  @Column()
  tourId: string;
}
