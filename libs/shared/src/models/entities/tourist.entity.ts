import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TourStatus } from '@app/shared/models/enum';
import { StoreEntity } from '@app/shared/models/entities/store.entity';

@Entity('tour')
export class TourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  lastRegisterDate: Date;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @ManyToOne(() => StoreEntity, (store) => store.tours)
  store: StoreEntity;
}
