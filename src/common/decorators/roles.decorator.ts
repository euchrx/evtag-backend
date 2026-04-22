import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Array<'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR'>) =>
  SetMetadata(ROLES_KEY, roles);