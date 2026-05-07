import { Permission, Role } from '../types/api';

const ALL_PERMISSIONS: Permission[] = [
  'read:teams',
  'manage:teams',
  'validate:controle_technique',
  'read:scores',
  'create:scores',
  'update:own_scores',
  'read:planning',
  'manage:planning',
  'read:matchs',
  'manage:matchs',
  'create:rencontre',
  'read:classements',
  'read:users',
  'manage:own_profile',
  'manage:all_profiles',
  'delete:profile',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  organisateur: [
    'read:teams',
    'manage:teams',
    'validate:controle_technique',
    'read:scores',
    'read:planning',
    'manage:planning',
    'read:matchs',
    'manage:matchs',
    'create:rencontre',
    'read:classements',
    'read:users',
    'manage:own_profile',
  ],
  jury: [
    'read:teams',
    'read:scores',
    'create:scores',
    'update:own_scores',
    'read:planning',
    'read:matchs',
    'create:rencontre',
    'read:classements',
    'manage:own_profile',
  ],
  enseignant: [
    'read:teams',
    'read:scores',
    'read:planning',
    'read:matchs',
    'read:classements',
    'read:users',
    'manage:own_profile',
  ],
  eleve: [
    'read:teams',
    'read:scores',
    'read:planning',
    'read:matchs',
    'read:classements',
    'manage:own_profile',
  ],
};

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
