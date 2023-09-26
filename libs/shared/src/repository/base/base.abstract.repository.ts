import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { BaseInterfaceRepository } from './base.interface.repository';

interface HasId {
  id: string;
}

export abstract class BaseAbstractRepository<T extends HasId>
  implements BaseInterfaceRepository<T>
{
  private entity: Repository<T>;

  protected constructor(entity: Repository<T>) {
    this.entity = entity;
  }
  public async create(data: DeepPartial<T>): Promise<T> {
    return await this.entity.create(data);
  }
  public async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    return await this.entity.create(data);
  }
  public async save(data: DeepPartial<T>): Promise<T> {
    return await this.entity.save(data);
  }
  public async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
    return await this.entity.save(data);
  }

  // async updateById(id: any, data: DeepPartial<T>): Promise<T | UpdateResult> {
  //   return await this.entity.update(id, { ...data });
  // }
  public async findOneById(id: any): Promise<T> {
    const options: FindOptionsWhere<T> = {
      id: id,
    };
    return await this.entity.findOneBy(options);
  }
  public async findByCondition(filterCondition: FindOneOptions<T>): Promise<T> {
    return await this.entity.findOne(filterCondition);
  }
  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.entity.find(options);
  }
  public async findWithRelations(relations: FindManyOptions<T>): Promise<T[]> {
    return await this.entity.find(relations);
  }
  public async remove(data: T): Promise<T> {
    return await this.entity.remove(data);
  }
  public async removeCondition(
    filterCondition: FindManyOptions<T>,
  ): Promise<T[]> {
    const entityToRemove = await this.entity.find(filterCondition);
    if (entityToRemove) {
      return await this.entity.remove(entityToRemove);
    }
    return null; // Return null if no entity found matching the condition
  }
  public async preload(entity: DeepPartial<T>): Promise<T> {
    return await this.entity.preload(entity);
  }
  // search
}
