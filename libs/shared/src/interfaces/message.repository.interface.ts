import { BaseInterfaceRepository } from '@app/shared';
import { MessageEntity } from '@app/shared/models/entities/message.entity';

export type MessagesRepositoryInterface =
  BaseInterfaceRepository<MessageEntity>;
