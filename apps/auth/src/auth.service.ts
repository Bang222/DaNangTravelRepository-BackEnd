import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
import { ExistingUserDTO, NewUserDTO } from './dto';
import { UsersRepositoryInterface } from '@app/shared/interfaces/repository-interface/users.repository.interface';
import { AuthServiceInterface } from './interface/auth.service.interface';
import {
  EmailVerifiedService,
  FriendRequestEntity,
  FriendRequestRepository,
  UserEntity,
} from '@app/shared';
import { UserJwt } from '@app/shared/interfaces/service-interface/user-jwt.interface';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('FriendRequestRepositoryInterface')
    private readonly friendRequestRepository: FriendRequestRepository,
    private readonly jwtService: JwtService,
    @Inject('EmailServiceInterface')
    private readonly mailsService: EmailVerifiedService,
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
    const { firstName, lastName, email, password, sex } = newUser;
    // console.log(firstName);

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with that email already exists!');
    }
    await this.mailsService.sendEmailVerify(email);
    const hashedPassword = await this.hashPassword(password);

    const savedUser = await this.usersRepository.save({
      firstName,
      lastName,
      email,
      sex,
      createdTime: new Date(),
      password: hashedPassword,
    });

    delete savedUser.password;
    return savedUser;
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
    if (user.isEmailValidated === true) return null;

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

      if (!user) throw new UnauthorizedException('can not login');
      delete user.password;
      const jwt = await this.jwtService.signAsync({ user });

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
  async addFriend(
    userId: string,
    friendId: string,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId);
    const receiver = await this.findById(friendId);
    return await this.friendRequestRepository.save({ creator, receiver });
  }
  async getFriends(userId: string): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);
    return await this.friendRequestRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }
  async getFriendsList(userId: string) {
    const friendsRequests = await this.getFriends(userId);
    if (!friendsRequests) return [];
    const friends = friendsRequests.map((item) => {
      const isUserCreator = userId === item.creator.id; // creator is user
      const friendDetails = isUserCreator ? item.receiver : item.creator;
      const { id, firstName, lastName, email } = friendDetails;
      return { id, firstName, lastName, email };
    });
    return friends;
  }
}
