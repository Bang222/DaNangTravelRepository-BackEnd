import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { RedisCacheService } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({ cors: true })
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: ClientProxy,
    @Inject('PRESENCE_SERVICE')
    private readonly presenceService: ClientProxy,
    private readonly cache: RedisCacheService,
    private readonly chatService: ChatService,
  ) {}
  @WebSocketServer()
  server: Server;
  handleDisconnect(socket: Socket) {
    console.log('HANDLE DISCONNECT - CONVO');
  }
  async handleConnection(socket: Socket) {
    const jwt = socket.handshake.headers.authorization ?? null;
    if (!jwt) {
      this.handleDisconnect(socket);
      return;
    }
    const ob$ = this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt });
    const res = await firstValueFrom(ob$).catch((err) => console.error(err));
    if (!res || !res.user) {
      this.handleDisconnect(socket);
      return;
    }
    const { user } = res;
    socket.data.user = user;
    await this.setConversationUser(socket); // cache
    await this.createConversationUser(socket, user.id);
    await this.getConversationUser(socket);
  }
  @SubscribeMessage('sendMessage') // to front end connect
  private async getConversationUser(socket: Socket) {
    const { user } = socket.data;
    if (!user) return;
    const conversations = await this.chatService.getConversations(user.id);
    this.server.to(socket.id).emit('getAllConversations', conversations);
  }
  private async createConversationUser(socket: Socket, userId: string) {
    const ob2$ = this.authService.send({ cmd: 'get-friend-list' }, { userId });
    const friends = await firstValueFrom(ob2$).catch((err) =>
      console.error(err),
    );
    friends.forEach(async (friend) => {
      await this.chatService.createConversation(userId, friend.id);
    });
  }
  private async setConversationUser(socket: Socket) {
    const user = socket.data?.user;
    if (!user || !user.id) return;
    const conversationUser = { id: user.id, socketId: socket.id };
    await this.cache.set(`conversationUser ${user.id}`, conversationUser);
  }
}
