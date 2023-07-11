import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('store')
export class StoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  slogan: string;
  @Column()
  isActive: boolean;
}
