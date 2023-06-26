import { UserRequest } from '@app/shared';

export interface UserJwt extends UserRequest {
  iat: number;
  exp: number;
}