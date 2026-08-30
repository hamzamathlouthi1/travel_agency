import { Role } from './role.model';

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly Role[];
}
