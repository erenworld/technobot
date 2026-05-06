import { MatchSumo, RencontreSumo, ConfigurationDepartValue } from './MatchSumo';

export interface MatchSumoFilters {
  editionId?: string;
  poule?: string;
  zone?: string;
  statut?: string;
}

export interface CreateRencontreSumoData {
  readonly vainqueurId: string | null;
  readonly yukoA: number;
  readonly yukoB: number;
  readonly yuseiA: number;
  readonly yuseiB: number;
  readonly configurationDepart: ConfigurationDepartValue;
  readonly dureeSecondes: number | null;
  readonly annulee: boolean;
  readonly observations: string | null;
}

export interface MatchSumoRepository {
  getById(id: string): Promise<MatchSumo | null>;
  getAll(filters: MatchSumoFilters): Promise<MatchSumo[]>;
  createRencontre(matchId: string, data: CreateRencontreSumoData): Promise<RencontreSumo>;
}
