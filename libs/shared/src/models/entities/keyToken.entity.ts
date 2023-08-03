import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '@app/shared';

@Entity('token')
export class KeyTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => UserEntity) // Define the relationship with UserEntity
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string; //'user Id

  @Column({ nullable: false })
  publicKey: string;
  @Column({ nullable: false })
  privateKey: string;

  @Column({ nullable: true })
  refreshToken: string;
  @Column('text', { nullable: true, array: true, default: [] })
  refreshTokenUsed: string[];
}
