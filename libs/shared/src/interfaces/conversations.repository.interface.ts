import { BaseInterfaceRepository } from '@app/shared';
import { ConversationEntity } from '@app/shared/models/entities/converstion.entity';

export interface ConversationsRepositoryInterface
  extends BaseInterfaceRepository<ConversationEntity> {
  findConversations(
    userId: string,
    friendId: string,
  ): Promise<ConversationEntity | undefined>;
}
