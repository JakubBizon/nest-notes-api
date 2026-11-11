import { User } from '../../database/schema';

export type AuthUser = {
  id: string;
  email: string;
  role: User['role'];
};
