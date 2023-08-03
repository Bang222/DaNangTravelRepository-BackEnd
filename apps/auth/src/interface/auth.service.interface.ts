import { UserEntity } from '@app/shared/models/entities/user.entity';
import { ExistingUserDTO, NewUserDTO } from '../dto';

export interface AuthServiceInterface {
  getHello(): string;
  getUsers(): Promise<UserEntity[]>;
  getUserById(id: string): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity>;
  hashPassword(password: string): Promise<string>;
  register(newUser: Readonly<NewUserDTO>): Promise<UserEntity>;
  validateUser(email: string, password: string): Promise<UserEntity>;
  login(existingUser: Readonly<ExistingUserDTO>): Promise<{
    token: any;
    user: UserEntity;
  }>;
  // : Promise<{ user: UserEntity; exp: number }>
  verifyJWT(jwt: string, userId: string);
  signJWT(data: any, privateKey: any);
  getUserFromHeader(jwt: string);
}
