import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '@app/shared';
import { FriendRequestRepositoryInterface } from '@app/shared/interfaces/friend-request.repository.interface';
import { FriendRequestEntity } from '@app/shared/models/entities/friend-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
