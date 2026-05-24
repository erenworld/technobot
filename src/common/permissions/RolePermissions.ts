import { UserRole } from '../decorators/Roles.decorator';
import { Permission } from './Permission';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.values(Permission),
  organisateur: [
    Permission.READ_TEAMS,
    Permission.MANAGE_TEAMS,
    Permission.VALIDATE_CONTROLE_TECHNIQUE,
    Permission.READ_SCORES,
    Permission.READ_PLANNING,
    Permission.MANAGE_PLANNING,
    Permission.READ_MATCHS,
    Permission.MANAGE_MATCHS,
    Permission.CREATE_RENCONTRE,
    Permission.READ_CLASSEMENTS,
    Permission.READ_USERS,
    Permission.MANAGE_OWN_PROFILE,
  ],
  jury: [
    Permission.READ_TEAMS,
    Permission.READ_SCORES,
    Permission.CREATE_SCORES,
    Permission.UPDATE_OWN_SCORES,
    Permission.READ_PLANNING,
    Permission.READ_MATCHS,
    Permission.CREATE_RENCONTRE,
    Permission.READ_CLASSEMENTS,
    Permission.MANAGE_OWN_PROFILE,
  ],
  enseignant: [
    Permission.READ_TEAMS,
    Permission.READ_SCORES,
    Permission.READ_PLANNING,
    Permission.READ_MATCHS,
    Permission.READ_CLASSEMENTS,
    Permission.READ_USERS,
    Permission.MANAGE_OWN_PROFILE,
  ],
  eleve: [
    Permission.READ_TEAMS,
    Permission.READ_SCORES,
    Permission.READ_PLANNING,
    Permission.READ_MATCHS,
    Permission.READ_CLASSEMENTS,
    Permission.MANAGE_OWN_PROFILE,
  ],
};
