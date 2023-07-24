import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { ExistingUserDTO, NewUserDTO } from './dto';
import { UsersRepositoryInterface } from '@app/shared/interfaces/repository-interface/users.repository.interface';
import { AuthServiceInterface } from './interface/auth.service.interface';
import { UserJwt } from '@app/shared/interfaces/service-interface/user-jwt.interface';
import { UserEntity } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    private readonly jwtService: JwtService,
    @Inject('MAIL_SERVICE') private emailService: ClientProxy,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
  async getUsers(): Promise<UserEntity[]> {
    return await this.usersRepository.findAll({ relations: { store: true } });
  }

  async getUserById(id: string): Promise<UserEntity> {
    return await this.usersRepository.findOneById(id);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findByCondition({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'address',
        'createdTime',
        'profilePicture',
        'phone',
        'email',
        'sex',
        'password',
        'role',
        'isEmailValidated',
      ],
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return this.usersRepository.findOneById(id);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  async register(newUser: Readonly<NewUserDTO>): Promise<UserEntity> {
    const { firstName, lastName, email, password, sex, address } = newUser;
    // console.log(firstName);
    const existingUser = await this.findByEmail(email);
    try {
      if (existingUser) {
        throw new BadRequestException(
          'An account with that email already exists!',
        );
      }
      const hashedPassword = await this.hashPassword(password);

      const savedUser = await this.usersRepository.save({
        firstName,
        lastName,
        email,
        sex,
        address,
        createdTime: new Date(),
        password: hashedPassword,
      });
      delete savedUser.password;
      // Converting Observable to Promise and awaiting the result
      await this.emailService
        .send({ email: 'send-email' }, { email: email })
        .toPromise();
      return savedUser;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;
    if (!doesUserExist) return null;
    // if (user.isEmailValidated === true) return null;

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;
    return user;
  }

  async login(existingUser: Readonly<ExistingUserDTO>) {
    try {
      const { email, password } = existingUser;
      const user = await this.validateUser(email, password);

      if (!user) throw new UnauthorizedException('Please Register Broo!!');
      delete user.password;
      const jwt = await this.jwtService.signAsync({ user });
      // res.cookie('token', jwt, { httpOnly: true });
      return { token: jwt, user };
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;
    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
