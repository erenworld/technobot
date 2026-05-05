import { ScoreSuiviLigne } from './ScoreSuiviLigne';

export interface CreateScoreSuiviLigneData {
  readonly teamId: string;
  readonly juryId: string;
  readonly distancePct: number;
  readonly parcoursFini: boolean;
  readonly tempsSecondes: number | null;
  readonly bonusTrace1: boolean;
  readonly bonusTrace2: boolean;
  readonly bonusTrace3: boolean;
  readonly bonusTrace4: boolean;
  readonly bonusTrace5: boolean;
  readonly bonusTrace6: boolean;
  readonly observations: string | null;
}

export interface UpdateScoreSuiviLigneData {
  readonly distancePct?: number;
  readonly parcoursFini?: boolean;
  readonly tempsSecondes?: number | null;
  readonly bonusTrace1?: boolean;
  readonly bonusTrace2?: boolean;
  readonly bonusTrace3?: boolean;
  readonly bonusTrace4?: boolean;
  readonly bonusTrace5?: boolean;
  readonly bonusTrace6?: boolean;
  readonly observations?: string | null;
}

export interface ScoreSuiviLigneRepository {
  create(data: CreateScoreSuiviLigneData): Promise<ScoreSuiviLigne>;
  getById(id: string): Promise<ScoreSuiviLigne | null>;
  update(id: string, data: UpdateScoreSuiviLigneData): Promise<ScoreSuiviLigne>;
}
