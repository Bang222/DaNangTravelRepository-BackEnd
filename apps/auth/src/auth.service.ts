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
      const findUser = await this.getUserById(userId);
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
      throw new ForbiddenException(e);
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
      throw new BadRequestException(e);
    }
  }
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExist = !!user;
    if (!doesUserExist) return null;
    // if (user.isEmailValidated === true) return null;

    const doesPasswordMatch = await this.authUtil.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;
    return user;
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

  async login(existingUser: Readonly<ExistingUserDTO>) {
    try {
      const { email, password } = existingUser;
      const user = await this.validateUser(email, password);
      if (!user) throw new UnauthorizedException('Please Register!!');
      delete user.password;
      const accessAndRefresh = await this.signTokenUsingPrivateKeyAndPublishKey(
        user.id,
      );
      return { token: accessAndRefresh, user };
    } catch (err) {
      throw new UnauthorizedException(err);
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
      throw new UnauthorizedException();
    }
  }
  async getUserFromHeader(jwt: string) {
    if (!jwt) return;
    try {
      const decoded = decode(jwt);
      return decoded;
    } catch (error) {
      throw new BadRequestException();
    }
  }
  async logOut(userId: string) {
    const findKeyToken = await this.keyTokenRepository.findByCondition({
      where: { userId: userId },
    });
    if (!findKeyToken) return { msg: 'can not found' };
    return await this.keyTokenRepository.remove({ ...findKeyToken });
  }
}
