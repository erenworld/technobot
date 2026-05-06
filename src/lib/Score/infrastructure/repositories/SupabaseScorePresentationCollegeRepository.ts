import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { ScorePresentationCollegeRepository, CreateScorePresentationCollegeData, UpdateScorePresentationCollegeData } from '../../domain/ScorePresentationCollegeRepository';
import { ScorePresentationCollege } from '../../domain/ScorePresentationCollege';

interface Row {
  id: string;
  team_id: string;
  jury_id: string;
  aisance: number;
  langues: number;
  contenu: number;
  outils: number;
  bonus_suivi_ovale: boolean;
  bonus_connecte: boolean;
  total: number | null;
  observations: string | null;
}

@Injectable()
export class SupabaseScorePresentationCollegeRepository implements ScorePresentationCollegeRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: Row): ScorePresentationCollege {
    return new ScorePresentationCollege({
      id: row.id,
      teamId: row.team_id,
      juryId: row.jury_id,
      aisance: row.aisance,
      langues: row.langues,
      contenu: row.contenu,
      outils: row.outils,
      bonusSuiviOvale: row.bonus_suivi_ovale,
      bonusConnecte: row.bonus_connecte,
      total: row.total,
      observations: row.observations,
    });
  }

  async create(data: CreateScorePresentationCollegeData): Promise<ScorePresentationCollege> {
    const { data: row, error } = await this.supabase
      .from('scores_presentation_colleges')
      .insert({
        team_id: data.teamId,
        jury_id: data.juryId,
        aisance: data.aisance,
        langues: data.langues,
        contenu: data.contenu,
        outils: data.outils,
        bonus_suivi_ovale: data.bonusSuiviOvale,
        bonus_connecte: data.bonusConnecte,
        observations: data.observations,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating score_presentation_college: ${error.message} ${error.code}`);
    return this.mapToDomain(row as Row);
  }

  async getById(id: string): Promise<ScorePresentationCollege | null> {
    const { data, error } = await this.supabase.from('scores_presentation_colleges').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching: ${error.message}`);
    }
    return this.mapToDomain(data as Row);
  }

  async update(id: string, data: UpdateScorePresentationCollegeData): Promise<ScorePresentationCollege> {
    const payload: Record<string, unknown> = {};
    if (data.aisance !== undefined) payload.aisance = data.aisance;
    if (data.langues !== undefined) payload.langues = data.langues;
    if (data.contenu !== undefined) payload.contenu = data.contenu;
    if (data.outils !== undefined) payload.outils = data.outils;
    if (data.bonusSuiviOvale !== undefined) payload.bonus_suivi_ovale = data.bonusSuiviOvale;
    if (data.bonusConnecte !== undefined) payload.bonus_connecte = data.bonusConnecte;
    if (data.observations !== undefined) payload.observations = data.observations;

    const { data: row, error } = await this.supabase.from('scores_presentation_colleges').update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Error updating: ${error.message}`);
    return this.mapToDomain(row as Row);
  }
}
