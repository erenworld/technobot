import { Team } from './Team';
import { TeamId } from './TeamId';
import { TeamStatut, TeamStatutValue } from './TeamStatut';
import { TeamCategorieValue } from './TeamCategorie';
import { TeamEpreuveValue } from './TeamEpreuve';

export interface TeamFilters {
  readonly categorie?: TeamCategorieValue;
  readonly epreuve?: TeamEpreuveValue;
  readonly statut?: TeamStatutValue;
  readonly editionId?: string;
}

export interface TeamRepository {
  getAll(filters: TeamFilters): Promise<Team[]>;
  getOneById(id: TeamId): Promise<Team | null>;
  updateControle(id: TeamId, statut: TeamStatut, notesTechnique: string | null): Promise<void>;
}
