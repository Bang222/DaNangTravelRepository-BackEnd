import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  ScheduleEntity,
  ScheduleRepositoryInterface,
} from '@app/shared';

@Injectable()
export class ScheduleRepository
  extends BaseAbstractRepository<ScheduleEntity>
  implements ScheduleRepositoryInterface
{
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
  ) {
    super(scheduleRepository);
  }
}
