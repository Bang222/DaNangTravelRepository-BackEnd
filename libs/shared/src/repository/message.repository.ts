import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseAbstractRepository } from '@app/shared/repository/base/base.abstract.repository';
import { MessagesRepositoryInterface } from '@app/shared/interfaces/repository-interface/message.repository.interface';
import { MessageEntity } from '@app/shared/models/entities/message.entity';

@Injectable()
export class MessageRepository
  extends BaseAbstractRepository<MessageEntity>
  implements MessagesRepositoryInterface
{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {
    super(messageRepository);
  }
}
