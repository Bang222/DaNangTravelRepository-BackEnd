import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ActiveUser } from './interfaces/ActiveUser';
import { FriendRequestEntity } from '@app/shared';

@WebSocketGateway({ cors: true })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}
  @WebSocketServer()
  server: Server;
  async onModuleInit() {
    await this.cache.reset();
  }
  private async getFriend(userId: number) {
    const ob$ = this.authService.send<FriendRequestEntity[]>(
      { cmd: 'get-friend' },
      { userId },
    );
    const friendRequests = await firstValueFrom(ob$).catch((err) =>
      console.error(err),
    );
    if (!friendRequests) return;
    const friends = friendRequests.map((friendRequest) => {
      const isUserCreator = userId === friendRequest.creator.id;
      const friendDetails = isUserCreator
        ? friendRequest.receiver
        : friendRequest.creator;
      const { id, firstName, lastName, email } = friendDetails;
      return {
        id,
        email,
        firstName,
        lastName,
      };
    });
    return friends;
  }
  private async emitStatusToFriend(activeUser: ActiveUser) {
    const friends = await this.getFriend(activeUser.id);
    for (const f of friends) {
      const user = await this.cache.get(`user ${f.id}`);
      if (!user) continue; // nếu như user không có thì nó sẽ loop user khác
      const friend = user as ActiveUser;
      // active who is online
      this.server.to(friend.socketId).emit('friendActive', {
        id: activeUser.id,
        isActive: activeUser.isActive,
      });
      //let's me know who is online
      if (activeUser.isActive) {
        this.server.to(friend.socketId).emit('friendActive', {
          id: activeUser.id,
          isActive: activeUser.isActive,
        });
      }
    }
  }
  private async setActiveStatus(socket: Socket, isActive: boolean) {
    const user = socket.data?.user;
    if (!user) return;
    const activeUser: ActiveUser = {
      id: user.id,
      socketId: socket.id,
      isActive,
    };
    await this.cache.set(`user ${user.id}`, activeUser, 0); //ttl time to leave
    await this.emitStatusToFriend(activeUser);
  }

  async handleConnection(socket: Socket) {
    console.log('Connection');
    const jwt = socket.handshake.headers.authorization ?? null;
    if (!jwt) {
      await this.handleDisconnect(socket);
      return;
    }
    const ob$ = this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt });
    const res = await firstValueFrom(ob$).catch((err) => console.error(err));
    if (!res || res?.user) {
      await this.handleDisconnect(socket);
      return;
    }
    const { user } = res;
    socket.data.user = user;
    await this.setActiveStatus(socket, true);
  }

  async handleDisconnect(socket: Socket) {
    await this.setActiveStatus(socket, false);
  }
  @SubscribeMessage('updateActiveStatus')
  async updateActiveStatus(socket: Socket, isActive: boolean) {
    if (!socket.data.id) return;
    await this.setActiveStatus(socket, isActive);
  }
}
