import { BaseInterfaceRepository } from '@app/shared/repository/base/base.interface.repository';
import { UserEntity } from '@app/shared/entities/user.entity';

export interface UsersRepositoryInterface extends BaseInterfaceRepository <UserEntity>{}