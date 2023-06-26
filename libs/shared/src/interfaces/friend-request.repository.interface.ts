import { BaseInterfaceRepository } from '@app/shared';
import { FriendRequestEntity } from '@app/shared/models/entities/friend-request.entity';

export interface FriendRequestRepositoryInterface
  extends BaseInterfaceRepository<FriendRequestEntity> {}
