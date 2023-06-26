import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, catchError, mergeMap } from 'rxjs';

import { UserJwt } from '../interfaces/user-jwt.interface';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return next.handle();

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) return next.handle();

    const [, jwt] = authHeaderParts;

    return this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt }).pipe(
      mergeMap(({ user }) => {
        // like async and sync switch map sync and mergeMap is Async
        request.user = user;
        return next.handle();
      }),
      catchError(() => next.handle()),
    );
  }
}
