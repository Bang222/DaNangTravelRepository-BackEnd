import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from "../../auth/src/user.entity";


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
    TypeOrmModule.forFeature([UserEntity]),
  ],
})
export class PostgresdbModule {}
