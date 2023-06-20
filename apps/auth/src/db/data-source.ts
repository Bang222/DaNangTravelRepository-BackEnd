import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '@app/shared';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  entities: [UserEntity],
  migrations: ['dist/apps/auth/db/migrations/*.js'],
  // synchronize: true,
};
export const dataSource = new DataSource(dataSourceOptions);
