import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';

import { catchError, Observable, of, switchMap } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class CookieResInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    if (context.getType() !== 'http') return next.handle();

    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      switchMap((data) => {
        response.cookie('token', data?.token, { httpOnly: true });
        return of(data);
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }
}
