import { UserEntity } from '@app/shared/models/entities/user.entity';
import { ExistingUserDTO, NewUserDTO } from '../dto';
import { UserJwt } from '@app/shared/interfaces/service-interface/user-jwt.interface';
import { FriendRequestEntity } from '@app/shared/models/entities/friend-request.entity';

export interface AuthServiceInterface {
  getHello(): string;
  getUsers(): Promise<UserEntity[]>;
  getUserById(id: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity>;
  hashPassword(password: string): Promise<string>;
  register(newUser: Readonly<NewUserDTO>): Promise<UserEntity>;
  doesPasswordMatch(password: string, hashedPassword: string): Promise<boolean>;
  validateUser(email: string, password: string): Promise<UserEntity>;
  login(existingUser: Readonly<ExistingUserDTO>): Promise<{
    token: string;
    user: UserEntity;
  }>;
  verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }>;
  getUserFromHeader(jwt: string): Promise<UserJwt>;
  addFriend(userId: string, friendId: string): Promise<FriendRequestEntity>;
  getFriends(userId: string): Promise<FriendRequestEntity[]>;
}
