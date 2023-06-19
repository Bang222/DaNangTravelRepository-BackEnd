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
        url: process.env.POSTGRES_URI,
        autoLoadEntities: true,
        // entities: [UserEntity],
        synchronize: true, // shouldn't be used in production - may lose db
      }),
      inject: [ConfigService],
    }),
  ],
})
export class PostgresdbModule {}
