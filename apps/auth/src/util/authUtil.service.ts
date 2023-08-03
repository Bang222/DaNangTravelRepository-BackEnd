import { sign } from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { KeyTokenRepositoryInterface, UserEntity } from '@app/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUtilService {
  constructor(
    @Inject('KeyTokenRepositoryInterface')
    private readonly keyTokenRepository: KeyTokenRepositoryInterface,
  ) {}
  async refreshToken(data: any, privateKey: string) {
    return sign({ data }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '365 days',
    });
  }
  async accessToken(data: any, privateKey: string) {
    return sign({ data }, privateKey, {
      algorithm: 'RS256',
      expiresIn: '10 days',
    });
  }
  async createToken(userId: string, publicKey: string, privateKey: string) {
    const publicKeyString = publicKey.toString();
    const privateKeyString = privateKey.toString();
    const tokens = await this.keyTokenRepository.save({
      userId: userId,
      publicKey: publicKeyString,
      privateKey: privateKeyString,
    });
    return tokens ? tokens.publicKey && tokens.privateKey : null;
  }
  async createTokenPair(payload: Readonly<UserEntity>, privateKey: string) {
    try {
      const findKeyUser = await this.keyTokenRepository.findByCondition({
        where: { userId: payload.id },
      });
      const privateKeyToString = privateKey.toString();
      const access = await this.accessToken(payload, privateKeyToString);
      const refresh = await this.refreshToken(payload, privateKeyToString);
      await this.keyTokenRepository.save({
        ...findKeyUser,
        refreshToken: refresh,
      });
      return { access, refresh };
    } catch (e) {
      console.error(e);
    }
  }
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
