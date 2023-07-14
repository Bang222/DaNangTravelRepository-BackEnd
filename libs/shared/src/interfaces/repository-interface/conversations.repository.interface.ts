import { BaseInterfaceRepository, ConversationEntity } from '@app/shared';

export interface ConversationsRepositoryInterface
  extends BaseInterfaceRepository<ConversationEntity> {
  findConversations(
    userId: string,
    friendId: string,
  ): Promise<ConversationEntity | undefined>;
}
