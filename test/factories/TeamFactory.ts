import { Team } from '../../src/lib/Team/domain/Team';
import { TeamId } from '../../src/lib/Team/domain/TeamId';
import { TeamStatut, TeamStatutValue } from '../../src/lib/Team/domain/TeamStatut';
import { TeamCategorie, TeamCategorieValue } from '../../src/lib/Team/domain/TeamCategorie';
import { TeamEpreuve, TeamEpreuveValue } from '../../src/lib/Team/domain/TeamEpreuve';

interface TeamOverrides {
  id?: string;
  immatriculation?: string;
  nomRobot?: string | null;
  categorie?: TeamCategorieValue;
  epreuve?: TeamEpreuveValue;
  statut?: TeamStatutValue;
  etablissementId?: string | null;
  editionId?: string | null;
  poidsG?: number | null;
  dimensionLxl?: string | null;
  coutHt?: number | null;
  notesTechnique?: string | null;
}

export function TeamFactory(overrides: TeamOverrides = {}): Team {
  return new Team({
    id: new TeamId(overrides.id ?? 'team-test-uuid'),
    immatriculation: overrides.immatriculation ?? 'DE01',
    nomRobot: overrides.nomRobot ?? 'TestBot',
    categorie: new TeamCategorie(overrides.categorie ?? 'college'),
    epreuve: new TeamEpreuve(overrides.epreuve ?? 'design'),
    statut: new TeamStatut(overrides.statut ?? 'inscrit'),
    etablissementId: overrides.etablissementId ?? 'etab-test-uuid',
    editionId: overrides.editionId ?? 'edition-test-uuid',
    poidsG: overrides.poidsG ?? null,
    dimensionLxl: overrides.dimensionLxl ?? null,
    coutHt: overrides.coutHt ?? null,
    notesTechnique: overrides.notesTechnique ?? null,
  });
}
