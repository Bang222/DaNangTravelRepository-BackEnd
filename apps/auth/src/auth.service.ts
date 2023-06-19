import {
  ConflictException,
  Injectable,
  UnauthorizedException, UseGuards
} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';

import { JwtService } from '@nestjs/jwt';
import { ExistingUserDto, NewUserDto } from '../dtos';
import { JwtGuard } from "./jwt.guard";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  async getUsers() {
    return this.userRepository.find();
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }
  async hasPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  async register(newUser: Readonly<NewUserDto>): Promise<UserEntity> {
    const { firstName, lastName, email, password } = newUser;
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with that email already exists');
    }
    const hashedPassword = await this.hasPassword(password);
    const savedUser = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    delete savedUser.password;
    return savedUser;
  }
  async doesPasswordMatch(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    const doesUserExist = !!user;
    if (!doesUserExist) return null;
    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) return null;
    return user;
  }
  async login(existingUser: Readonly<ExistingUserDto>) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const jwt = await this.jwtService.signAsync({ user });
    return { token: jwt };
  }
  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException('not have jwt');
    }
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new UnauthorizedException('err');
    }
  }
}
