import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  ShareExperienceEntity,
  ShareExperienceRepositoryInterface,
} from '@app/shared';

@Injectable()
export class ShareExperience
  extends BaseAbstractRepository<ShareExperienceEntity>
  implements ShareExperienceRepositoryInterface
{
  constructor(
    @InjectRepository(ShareExperienceEntity)
    public readonly userShareExperienceRepository: Repository<ShareExperienceEntity>,
  ) {
    super(userShareExperienceRepository);
  }
}
