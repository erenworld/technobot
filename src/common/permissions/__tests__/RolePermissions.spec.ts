import { Permission } from '../Permission';
import { ROLE_PERMISSIONS } from '../RolePermissions';

describe('ROLE_PERMISSIONS', () => {
  it('admin should have all permissions', () => {
    const allPermissions = Object.values(Permission);
    expect(ROLE_PERMISSIONS.admin).toHaveLength(allPermissions.length);
    allPermissions.forEach((perm) => {
      expect(ROLE_PERMISSIONS.admin).toContain(perm);
    });
  });

  it('eleve should NOT have sensitive permissions', () => {
    const forbidden = [
      Permission.DELETE_PROFILE,
      Permission.MANAGE_ALL_PROFILES,
      Permission.MANAGE_TEAMS,
      Permission.VALIDATE_CONTROLE_TECHNIQUE,
    ];
    forbidden.forEach((perm) => {
      expect(ROLE_PERMISSIONS.eleve).not.toContain(perm);
    });
  });

  it('jury should have score permissions but not team management', () => {
    expect(ROLE_PERMISSIONS.jury).toContain(Permission.CREATE_SCORES);
    expect(ROLE_PERMISSIONS.jury).toContain(Permission.UPDATE_OWN_SCORES);
    expect(ROLE_PERMISSIONS.jury).not.toContain(Permission.MANAGE_TEAMS);
  });

  it('enseignant should have read permissions', () => {
    expect(ROLE_PERMISSIONS.enseignant).toContain(Permission.READ_TEAMS);
    expect(ROLE_PERMISSIONS.enseignant).toContain(Permission.READ_USERS);
    expect(ROLE_PERMISSIONS.enseignant).not.toContain(Permission.DELETE_PROFILE);
  });
});
