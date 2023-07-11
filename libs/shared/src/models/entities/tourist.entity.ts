import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role, TourStatus } from '@app/shared/models/enum';

@Entity('manager')
export class TourEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: TourStatus, default: TourStatus.ACTIVE })
  status: TourStatus;

  @Column()
  quantity: number;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  lastRegisterDate: Date;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;
}
