import { UserEntity } from '@app/shared/models/entities/user.entity';
import { ExistingUserDTO, NewUserDTO } from '../dto';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';

export interface AuthServiceInterface {
  getUsers(): Promise<UserEntity[]>;
  getUserById(id: number): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity>;
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
}
