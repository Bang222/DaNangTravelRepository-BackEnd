import { UserEntity } from '@app/shared/models/entities/user.entity';
import { BaseInterfaceRepository } from '@app/shared/repository/base/base.interface.repository';

export type UsersRepositoryInterface = BaseInterfaceRepository<UserEntity>;
