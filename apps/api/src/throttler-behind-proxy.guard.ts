import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

interface timesType {
  totalHits: number;
  timeToExpire: number;
}
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    const client = context.switchToHttp().getRequest();
    const ip = client.ip;
    const userId = client.headers['x-client-id'];
    let times: timesType;
    if (userId) {
      const key = this.generateKey(context, userId);
      times = await this.storageService.increment(key, ttl);
    } else {
      const key = this.generateKey(context, ip);
      times = await this.storageService.increment(key, ttl);
    }
    if (times.totalHits > limit * 2) {
      throw new ThrottlerException();
    }
    return true;
  }
}
