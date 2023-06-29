import { Inject, Injectable } from '@nestjs/common';
import {
  ConversationsRepositoryInterface,
  MessagesRepositoryInterface,
} from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';

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
}
