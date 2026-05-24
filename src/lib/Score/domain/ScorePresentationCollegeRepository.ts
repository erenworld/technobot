import { ScorePresentationCollege } from './ScorePresentationCollege';

export interface CreateScorePresentationCollegeData {
  readonly teamId: string;
  readonly juryId: string;
  readonly aisance: number;
  readonly langues: number;
  readonly contenu: number;
  readonly outils: number;
  readonly bonusSuiviOvale: boolean;
  readonly bonusConnecte: boolean;
  readonly observations: string | null;
}

export interface UpdateScorePresentationCollegeData {
  readonly aisance?: number;
  readonly langues?: number;
  readonly contenu?: number;
  readonly outils?: number;
  readonly bonusSuiviOvale?: boolean;
  readonly bonusConnecte?: boolean;
  readonly observations?: string | null;
}

export interface ScorePresentationCollegeRepository {
  create(data: CreateScorePresentationCollegeData): Promise<ScorePresentationCollege>;
  getById(id: string): Promise<ScorePresentationCollege | null>;
  update(id: string, data: UpdateScorePresentationCollegeData): Promise<ScorePresentationCollege>;
}
