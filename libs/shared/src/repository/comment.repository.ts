import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  CommentEntity,
  CommentRepositoryInterface,
} from '@app/shared';

@Injectable()
export class CommentRepository
  extends BaseAbstractRepository<CommentEntity>
  implements CommentRepositoryInterface
{
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {
    super(commentRepository);
  }
}
