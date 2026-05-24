import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { MatchSumoRepository, CreateRencontreSumoData, MatchSumoFilters } from '../../domain/MatchSumoRepository';
import { MatchSumo, MatchSumoStatutValue, RencontreSumo, ConfigurationDepartValue } from '../../domain/MatchSumo';

interface MatchSumoRow {
  id: string;
  edition_id: string | null;
  epreuve_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  poule: string | null;
  zone: string | null;
  heure_debut: string | null;
  statut: string | null;
  vainqueur_team_id: string | null;
  observations: string | null;
  rencontres_sumo: RencontreRow[];
}

interface RencontreRow {
  id: string;
  match_id: string;
  numero_rencontre: number;
  vainqueur_id: string | null;
  yuko_a: number;
  yuko_b: number;
  yusei_a: number;
  yusei_b: number;
  configuration_depart: string;
  duree_secondes: number | null;
  annulee: boolean;
  observations: string | null;
}

@Injectable()
export class SupabaseMatchSumoRepository implements MatchSumoRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapRencontre(row: RencontreRow): RencontreSumo {
    return new RencontreSumo({
      id: row.id,
      matchId: row.match_id,
      numeroRencontre: row.numero_rencontre,
      vainqueurId: row.vainqueur_id,
      yukoA: row.yuko_a,
      yukoB: row.yuko_b,
      yuseiA: row.yusei_a,
      yuseiB: row.yusei_b,
      configurationDepart: row.configuration_depart as ConfigurationDepartValue,
      dureeSecondes: row.duree_secondes,
      annulee: row.annulee,
      observations: row.observations,
    });
  }

  async getById(id: string): Promise<MatchSumo | null> {
    const { data, error } = await this.supabase
      .from('matchs_sumo')
      .select('*, rencontres_sumo(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching match sumo: ${error.message}`);
    }

    const row = data as MatchSumoRow;
    return this.mapMatch(row);
  }

  async getAll(filters: MatchSumoFilters): Promise<MatchSumo[]> {
    let query = this.supabase
      .from('matchs_sumo')
      .select('*, rencontres_sumo(*)');

    if (filters.editionId) query = query.eq('edition_id', filters.editionId);
    if (filters.poule) query = query.eq('poule', filters.poule);
    if (filters.zone) query = query.eq('zone', filters.zone);
    if (filters.statut) query = query.eq('statut', filters.statut);

    const { data, error } = await query;

    if (error) throw new Error(`Error fetching matchs sumo: ${error.message}`);

    return (data as MatchSumoRow[]).map((row) => this.mapMatch(row));
  }

  private mapMatch(row: MatchSumoRow): MatchSumo {
    return new MatchSumo({
      id: row.id,
      editionId: row.edition_id,
      epreuveId: row.epreuve_id,
      teamAId: row.team_a_id,
      teamBId: row.team_b_id,
      poule: row.poule,
      zone: row.zone,
      heureDebut: row.heure_debut,
      statut: row.statut as MatchSumoStatutValue | null,
      vainqueurTeamId: row.vainqueur_team_id,
      observations: row.observations,
      rencontres: (row.rencontres_sumo ?? []).map((r) => this.mapRencontre(r)),
    });
  }

  async createRencontre(matchId: string, data: CreateRencontreSumoData): Promise<RencontreSumo> {
    const { data: countData } = await this.supabase
      .from('rencontres_sumo')
      .select('id', { count: 'exact' })
      .eq('match_id', matchId);

    const nextNumero = ((countData?.length ?? 0) + 1);

    const { data: row, error } = await this.supabase
      .from('rencontres_sumo')
      .insert({
        match_id: matchId,
        numero_rencontre: nextNumero,
        vainqueur_id: data.vainqueurId,
        yuko_a: data.yukoA,
        yuko_b: data.yukoB,
        yusei_a: data.yuseiA,
        yusei_b: data.yuseiB,
        configuration_depart: data.configurationDepart,
        duree_secondes: data.dureeSecondes,
        annulee: data.annulee,
        observations: data.observations,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating rencontre: ${error.message}`);
    return this.mapRencontre(row as RencontreRow);
  }
}
