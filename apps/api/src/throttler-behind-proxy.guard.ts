import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const client = context.switchToHttp().getRequest();
    const ip = client.ip;
    const key = this.generateKey(context, ip);
    const { totalHits } = await this.storageService.increment(key, ttl);
    if (totalHits > limit * 2) {
      throw new ThrottlerException();
    }

    return true;
  }
}
