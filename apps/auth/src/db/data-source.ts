import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../src/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [UserEntity],
  migrations: ['dist/apps/auth/db/migrations/*.js'],
  // synchronize: true,
};
export const dataSource = new DataSource(dataSourceOptions);
