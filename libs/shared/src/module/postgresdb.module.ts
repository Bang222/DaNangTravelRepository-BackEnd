import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'postgres',
        // replication: {
        //   master: {
        url: process.env.POSTGRES_URI,
        //   },
        //   slaves: [
        //     {
        //       url: process.env.POSTGRES_REPLICATION_URI,
        //     },
        //   ],
        // },
        // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true, // production - may lose db // automatic create new colum
        // extra: { connectionLimit: 10 },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class PostgresdbModule {}
