import { ScoreDesign } from '../../src/lib/Score/domain/ScoreDesign';

interface ScoreDesignOverrides {
  id?: string;
  teamId?: string;
  juryId?: string;
  accessInterrupteur?: number;
  refroidCarte?: number;
  acesCableProg?: number;
  facilitePiles?: number;
  solidite?: number;
  homogeneite?: number;
  oeuvreOriginale?: number;
  qualiteVisuelle?: number;
  dissimulationPieces?: number;
  qualiteAffiche?: number;
  qualiteEchange?: number;
  bonusSuiviOvale?: boolean;
  bonusConnecte?: boolean;
  total?: number | null;
  observations?: string | null;
}

export function ScoreDesignFactory(overrides: ScoreDesignOverrides = {}): ScoreDesign {
  return new ScoreDesign({
    id: overrides.id ?? 'score-design-test-uuid',
    teamId: overrides.teamId ?? 'team-test-uuid',
    juryId: overrides.juryId ?? 'jury-test-uuid',
    accessInterrupteur: overrides.accessInterrupteur ?? 2,
    refroidCarte: overrides.refroidCarte ?? 2,
    acesCableProg: overrides.acesCableProg ?? 2,
    facilitePiles: overrides.facilitePiles ?? 2,
    solidite: overrides.solidite ?? 2,
    homogeneite: overrides.homogeneite ?? 2,
    oeuvreOriginale: overrides.oeuvreOriginale ?? 2,
    qualiteVisuelle: overrides.qualiteVisuelle ?? 2,
    dissimulationPieces: overrides.dissimulationPieces ?? 2,
    qualiteAffiche: overrides.qualiteAffiche ?? 2,
    qualiteEchange: overrides.qualiteEchange ?? 2,
    bonusSuiviOvale: overrides.bonusSuiviOvale ?? false,
    bonusConnecte: overrides.bonusConnecte ?? false,
    total: overrides.total ?? 22,
    observations: overrides.observations ?? null,
  });
}
