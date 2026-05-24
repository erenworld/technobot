import { ScoreDesign } from './ScoreDesign';

export interface CreateScoreDesignData {
  readonly teamId: string;
  readonly juryId: string;
  readonly accessInterrupteur: number;
  readonly refroidCarte: number;
  readonly acesCableProg: number;
  readonly facilitePiles: number;
  readonly solidite: number;
  readonly homogeneite: number;
  readonly oeuvreOriginale: number;
  readonly qualiteVisuelle: number;
  readonly dissimulationPieces: number;
  readonly qualiteAffiche: number;
  readonly qualiteEchange: number;
  readonly bonusSuiviOvale: boolean;
  readonly bonusConnecte: boolean;
  readonly observations: string | null;
}

export interface UpdateScoreDesignData {
  readonly accessInterrupteur?: number;
  readonly refroidCarte?: number;
  readonly acesCableProg?: number;
  readonly facilitePiles?: number;
  readonly solidite?: number;
  readonly homogeneite?: number;
  readonly oeuvreOriginale?: number;
  readonly qualiteVisuelle?: number;
  readonly dissimulationPieces?: number;
  readonly qualiteAffiche?: number;
  readonly qualiteEchange?: number;
  readonly bonusSuiviOvale?: boolean;
  readonly bonusConnecte?: boolean;
  readonly observations?: string | null;
}

export interface ScoreDesignRepository {
  create(data: CreateScoreDesignData): Promise<ScoreDesign>;
  getById(id: string): Promise<ScoreDesign | null>;
  update(id: string, data: UpdateScoreDesignData): Promise<ScoreDesign>;
}
