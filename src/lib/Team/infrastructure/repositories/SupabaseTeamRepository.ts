import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { TeamRepository, TeamFilters } from '../../domain/TeamRepository';
import { Team } from '../../domain/Team';
import { TeamId } from '../../domain/TeamId';
import { TeamStatut } from '../../domain/TeamStatut';
import { TeamCategorie, TeamCategorieValue } from '../../domain/TeamCategorie';
import { TeamEpreuve, TeamEpreuveValue } from '../../domain/TeamEpreuve';

interface TeamRow {
  id: string;
  immatriculation: string;
  nom_robot: string | null;
  categorie: TeamCategorieValue;
  epreuve: TeamEpreuveValue;
  statut: string;
  etablissement_id: string | null;
  edition_id: string | null;
  poids_g: number | null;
  dimension_lxl: string | null;
  cout_ht: number | null;
  notes_technique: string | null;
}

@Injectable()
export class SupabaseTeamRepository implements TeamRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: TeamRow): Team {
    return new Team({
      id: new TeamId(row.id),
      immatriculation: row.immatriculation,
      nomRobot: row.nom_robot,
      categorie: new TeamCategorie(row.categorie),
      epreuve: new TeamEpreuve(row.epreuve),
      statut: new TeamStatut(row.statut as 'inscrit' | 'valide' | 'controle_technique_ok' | 'disqualifie'),
      etablissementId: row.etablissement_id,
      editionId: row.edition_id,
      poidsG: row.poids_g,
      dimensionLxl: row.dimension_lxl,
      coutHt: row.cout_ht,
      notesTechnique: row.notes_technique,
    });
  }

  async getAll(filters: TeamFilters): Promise<Team[]> {
    let query = this.supabase
      .from('teams')
      .select('id, immatriculation, nom_robot, categorie, epreuve, statut, etablissement_id, edition_id, poids_g, dimension_lxl, cout_ht, notes_technique');

    if (filters.categorie) query = query.eq('categorie', filters.categorie);
    if (filters.epreuve) query = query.eq('epreuve', filters.epreuve);
    if (filters.statut) query = query.eq('statut', filters.statut);
    if (filters.editionId) query = query.eq('edition_id', filters.editionId);

    const { data, error } = await query;
    if (error) throw new Error(`Error fetching teams: ${error.message}`);
    return (data as TeamRow[]).map((row) => this.mapToDomain(row));
  }

  async getOneById(id: TeamId): Promise<Team | null> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('id, immatriculation, nom_robot, categorie, epreuve, statut, etablissement_id, edition_id, poids_g, dimension_lxl, cout_ht, notes_technique')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching team: ${error.message}`);
    }

    return this.mapToDomain(data as TeamRow);
  }

  async updateControle(id: TeamId, statut: TeamStatut, notesTechnique: string | null): Promise<void> {
    const { error } = await this.supabase
      .from('teams')
      .update({ statut: statut.value, notes_technique: notesTechnique })
      .eq('id', id.value);

    if (error) throw new Error(`Error updating team: ${error.message}`);
  }
}
