import { MessageEntity } from '@app/shared/models/entities/message.entity';
import { BaseAbstractRepository } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagesRepositoryInterface } from '@app/shared/interfaces/message.repository.interface';

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
