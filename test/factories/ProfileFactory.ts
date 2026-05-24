import { AuthenticatedUser } from '../../src/common/guards/SupabaseAuthGuard';
import { UserRole } from '../../src/common/decorators/Roles.decorator';

interface ProfileOverrides {
  id?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: UserRole;
  etablissement_id?: string | null;
}

export function ProfileFactory(overrides: ProfileOverrides = {}): AuthenticatedUser {
  return {
    id: overrides.id ?? 'profile-test-uuid',
    nom: overrides.nom ?? 'Dupont',
    prenom: overrides.prenom ?? 'Jean',
    email: overrides.email ?? 'jean.dupont@test.fr',
    role: overrides.role ?? 'jury',
    etablissement_id: overrides.etablissement_id ?? 'etab-test-uuid',
  };
}
