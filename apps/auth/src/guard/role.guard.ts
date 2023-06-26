import { Injectable } from '@nestjs/common';
import { RolesGuard } from '@app/shared';

@Injectable()
export class UseRoleGuard extends RolesGuard {}