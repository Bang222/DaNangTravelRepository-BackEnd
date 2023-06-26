import { Request } from 'express';
import { Role } from '@app/shared/models/enum';

export interface UserRequest extends Request {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}