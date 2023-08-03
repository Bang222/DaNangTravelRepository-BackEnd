// passenger.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { OrderDetailEntity } from '@app/shared';

@Entity('passenger')
export class PassengerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['Adult', 'Child', 'Toddler', 'Infant'] })
  type: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: ['Men', 'Women', 'LGBT'] })
  sex: string;

  @Column({ nullable: true })
  dayOfBirth: string;

  @ManyToOne(() => OrderDetailEntity, (orderDetail) => orderDetail.passengers)
  orderDetail: OrderDetailEntity;
}
