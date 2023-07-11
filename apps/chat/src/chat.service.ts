import { Inject, Injectable } from '@nestjs/common';
import {
  ConversationsRepositoryInterface,
  MessagesRepositoryInterface,
  UserEntity,
} from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NewMessageDTO } from './dtos/NewMessage.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('ConversationsRepositoryInterface')
    private readonly conversationRepository: ConversationsRepositoryInterface,
    @Inject('MessagesRepositoryInterface')
    private readonly messagesRepository: MessagesRepositoryInterface,
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  private async getUser(id: string) {
    const os$ = this.authService.send<UserEntity>({ cmd: 'get-user' }, { id });
    const user = await firstValueFrom(os$).catch((err) => console.log(err));
    return user;
  }
  async createConversation(userId: string, friendId: string) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    if (!user || !friend) return;
    const conversation = await this.conversationRepository.findConversations(
      userId,
      friendId,
    );
    if (!conversation) {
      return this.conversationRepository.save({ users: [user, friend] });
    }
    return conversation;
  }
  async getConversations(userId: string) {
    const allConversations =
      await this.conversationRepository.findWithRelations({
        relations: ['users'],
      });
    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });
    return userConversations.map((conversation) => ({
      id: conversation.id,
      userIds: (conversation?.users ?? []).map((user) => user.id),
    }));
  }
  async createMessage(userId: string, newMessage: NewMessageDTO) {
    const user = await this.getUser(userId);
    if (!user) return;
    const conversation = await this.conversationRepository.findConversations(
      userId,
      newMessage.friendId,
    );
    if (!conversation) return;
    return await this.messagesRepository.save({
      message: newMessage.message,
      user,
      conversation,
    });
  }
}
