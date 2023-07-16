import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  MessagesRepositoryInterface,
  MessageEntity,
} from '@app/shared';

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
