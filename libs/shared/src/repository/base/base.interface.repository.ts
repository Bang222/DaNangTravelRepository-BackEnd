import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
// a signature method i gonna use
export interface BaseInterfaceRepository<T> {
  create(data: DeepPartial<T>): Promise<T>;
  createMany(data: DeepPartial<T>[]): Promise<T[]>;
  save(data: DeepPartial<T>): Promise<T>;
  saveMany(data: DeepPartial<T>[]): Promise<T[]>;
  // updateById(id: any, data: DeepPartial<T>): Promise<T | UpdateResult>;
  findOneById(id: any): Promise<T>;
  findByCondition(filterCondition: FindOneOptions<T>): Promise<T>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  remove(data: T): Promise<T>;
  removeCondition(filterCondition: FindOneOptions<T>): Promise<T[]>;
  findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
  preload(entityLike: DeepPartial<T>): Promise<T>;
}
