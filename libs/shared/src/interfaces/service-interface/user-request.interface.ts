import { Request } from 'express';
import { Role } from '@app/shared/models/enum';
import { StoreEntity } from '@app/shared/models/entities/store.entity';

export interface UserRequest extends Request {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    sex: string;
    isEmailValidated: boolean;
    address: string;
    phone: string;
    createdTime: Date;
    profilePicture: string;
    role: Role;
  };
}
