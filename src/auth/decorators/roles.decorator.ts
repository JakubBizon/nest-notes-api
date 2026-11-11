import { SetMetadata } from '@nestjs/common';
import { User } from '../../database/schema';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: User['role'][]) =>
  SetMetadata(ROLES_KEY, roles);
