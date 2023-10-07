import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { decode, sign, verify } from 'jsonwebtoken';
import { ExistingUserDTO, NewUserDTO } from './dto';
import { UsersRepositoryInterface } from '@app/shared/interfaces/repository-interface/users.repository.interface';
import { AuthServiceInterface } from './interface/auth.service.interface';
import { KeyTokenRepositoryInterface, UserEntity } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import * as crypto from 'crypto';
import { AuthUtilService } from './util/authUtil.service';
import axios from 'axios';
import { UserInfoGoogle } from './dto/auth-google-login.dto';
import { Role } from '@app/shared/models/enum';

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly usersRepository: UsersRepositoryInterface,
    @Inject('MAIL_SERVICE') private emailService: ClientProxy,
    @Inject('KeyTokenRepositoryInterface')
    private readonly keyTokenRepository: KeyTokenRepositoryInterface,
    private readonly authUtil: AuthUtilService,
  ) {}

  signJWT(data: any, privateKey: any) {
    return sign({ data }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '365 days',
    });
  }

  async verifyJWT(jwt: string, userId: string) {
    const findPublicKey = (
      await this.keyTokenRepository.findByCondition({
        where: { userId: userId },
      })
    ).publicKey;
    if (!findPublicKey) return null;
    return verify(jwt, findPublicKey, {
      algorithms: ['RS256'],
    });
  }

  async handleRefreshToken(userId: string, refreshToken: string) {
    try {
      const keyUser = await this.keyTokenRepository.findByCondition({
        where: { userId: userId },
      });

      if (!keyUser) {
        throw new BadRequestException('keyUser can not found keyUser');
      }
      if (keyUser.refreshTokenUsed.includes(refreshToken)) {
        await this.keyTokenRepository.remove({ ...keyUser });
        throw new ForbiddenException('login Again');
      }
      if (keyUser.refreshToken !== refreshToken) {
        return { msg: 'the Account already login exists' };
      }
      const findUser = await this.usersRepository.findByCondition({
        where: { id: userId },
        relations: { store: true },
      });
      const token = await this.authUtil.createTokenPair(
        findUser,
        keyUser.privateKey,
      );
      await this.keyTokenRepository.save({
        ...keyUser,
        refreshTokenUsed: [...keyUser.refreshTokenUsed, keyUser.refreshToken], // Combine arrays
        refreshToken: token.refresh,
      });
      return { token: token, user: findUser };
    } catch (e) {
      return e;
    }
  }

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
      relations: { store: true },
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
        'isActive',
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
      await this.emailService
        .send({ email: 'send-email' }, { email: email })
        .toPromise();
      return savedUser;
    } catch (e) {
      return e;
    }
  }
  async signTokenUsingPrivateKeyAndPublishKey(userId: string) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
    const findUserById = await this.getUserById(userId);
    const findKey = await this.keyTokenRepository.findByCondition({
      where: { userId: userId },
    });
    if (!findKey) {
      await this.authUtil.createToken(userId, publicKey, privateKey);
      return await this.authUtil.createTokenPair(findUserById, privateKey);
    }
    return await this.authUtil.createTokenPair(
      findUserById,
      findKey.privateKey,
    );
  }
  async validateGoogle(accessToken: string) {
    const userInfo = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!userInfo) return new BadRequestException('Error TK');
    return userInfo.data as UserInfoGoogle;
  }
  async loginGoogle(userInfo: UserInfoGoogle) {
    try {
      const findUserByEmail = await this.validateUserLoginGoogle(
        userInfo.email,
      );
      delete findUserByEmail.password;
      const accessAndRefresh = await this.signTokenUsingPrivateKeyAndPublishKey(
        findUserByEmail.id,
      );
      const user = await this.usersRepository.findByCondition({
        where: { id: findUserByEmail.id },
        relations: { store: true },
      });
      return { token: accessAndRefresh, user };
    } catch (e) {
      return e;
    }
  }
  async validateUserLoginGoogle(email: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    if (!user) throw new BadRequestException('Please Register!!');
    if (user.isEmailValidated === false)
      throw new BadRequestException('Please Validate Email!!');
    if (!user.isActive)
      throw new BadRequestException('Your Account is Banned!!!');
    return user;
  }
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    const doesUserExist = !!user;
    const doesPasswordMatch = await this.authUtil.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) throw new Error("Password doesn't match");
    if (user.role === Role.ADMIN) {
      return user;
    }
    if (!doesUserExist) throw new BadRequestException('Please Register!!');
    if (!user.isEmailValidated)
      throw new BadRequestException('Please Validate Email!!');
    if (!user.isActive)
      throw new BadRequestException('Your Account is Banned!!!');
    return user;
  }

  async login(existingUser: Readonly<ExistingUserDTO>) {
    try {
      const { email, password } = existingUser;
      const baseUser = await this.validateUser(email, password);
      delete baseUser.password;
      if (!baseUser) {
        throw new Error('Please Register!!');
      }
      const accessAndRefresh = await this.signTokenUsingPrivateKeyAndPublishKey(
        baseUser.id,
      );
      const user = await this.usersRepository.findByCondition({
        where: { id: baseUser.id },
        relations: { store: true },
      });
      return { token: accessAndRefresh, user };
    } catch (err) {
      return { error: err.message };
    }
  }
  async verifyJwt(jwt: string, userId: string) {
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      const decoded = this.verifyJWT(jwt, userId);
      if (!decoded) throw new BadRequestException('can not valid token');
      return decoded;
    } catch (error) {
      return error;
    }
  }
  async getUserFromHeader(jwt: string) {
    if (!jwt) return;
    try {
      return decode(jwt);
    } catch (error) {
      return error;
    }
  }

  async logOut(userId: string) {
    try {
      const findKeyToken = await this.keyTokenRepository.findByCondition({
        where: { userId: userId },
      });
      if (!findKeyToken)
        throw new BadRequestException({ msg: 'can not found' });
      return await this.keyTokenRepository.remove({ ...findKeyToken });
    } catch (e) {
      return e;
    }
  }
}
