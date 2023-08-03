import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'http') {
      return false;
    }
    const CLIENT_ID = 'x-client-id';
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) return false;
    const authHeaderParts = (authHeader as string).split(' ');

    if (authHeaderParts.length !== 2) return false;
    const userId = request.headers[CLIENT_ID];
    if (!userId) return false;
    const [, jwt] = authHeaderParts;
    return this.authService
      .send({ cmd: 'verify-jwt' }, { jwt, userId: userId })
      .pipe(
        switchMap((decoded) => {
          if (!decoded.exp) return of(false);
          const TOKEN_EXP_MS = decoded.exp * 1000;

          const isJwtValid = Date.now() < TOKEN_EXP_MS;

          return of(isJwtValid);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }
}
