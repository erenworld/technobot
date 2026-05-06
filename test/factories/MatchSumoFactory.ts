import { MatchSumo } from '../../src/lib/MatchSumo/domain/MatchSumo';

interface MatchSumoOverrides {
  id?: string;
  editionId?: string | null;
  epreuveId?: string | null;
  teamAId?: string | null;
  teamBId?: string | null;
  poule?: string | null;
  zone?: string | null;
  heureDebut?: string | null;
  statut?: 'planifie' | 'en_cours' | 'termine' | null;
  vainqueurTeamId?: string | null;
  observations?: string | null;
}

export function MatchSumoFactory(overrides: MatchSumoOverrides = {}): MatchSumo {
  return new MatchSumo({
    id: overrides.id ?? 'match-test-uuid',
    editionId: overrides.editionId ?? 'edition-test-uuid',
    epreuveId: overrides.epreuveId ?? 'epreuve-test-uuid',
    teamAId: overrides.teamAId ?? 'team-a-uuid',
    teamBId: overrides.teamBId ?? 'team-b-uuid',
    poule: overrides.poule ?? 'A',
    zone: overrides.zone ?? 'Sumo 1',
    heureDebut: overrides.heureDebut ?? '10:30',
    statut: overrides.statut ?? 'en_cours',
    vainqueurTeamId: overrides.vainqueurTeamId ?? null,
    observations: overrides.observations ?? null,
    rencontres: [],
  });
}
