import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  BaseAbstractRepository,
  FriendRequestRepositoryInterface,
  FriendRequestEntity,
} from '@app/shared';

@Injectable()
export class FriendRequestRepository
  extends BaseAbstractRepository<FriendRequestEntity>
  implements FriendRequestRepositoryInterface
{
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestEntity: Repository<FriendRequestEntity>,
  ) {
    super(friendRequestEntity);
  }
}
