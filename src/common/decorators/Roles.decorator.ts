import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'organisateur' | 'jury' | 'enseignant' | 'eleve';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
