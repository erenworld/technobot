import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { ScoreSuiviLigneRepository, CreateScoreSuiviLigneData, UpdateScoreSuiviLigneData } from '../../domain/ScoreSuiviLigneRepository';
import { ScoreSuiviLigne } from '../../domain/ScoreSuiviLigne';

interface Row {
  id: string;
  team_id: string;
  jury_id: string;
  distance_pct: number;
  parcours_fini: boolean;
  temps_secondes: number | null;
  calcul_500_temps: number | null;
  bonus_trace_1: boolean;
  bonus_trace_2: boolean;
  bonus_trace_3: boolean;
  bonus_trace_4: boolean;
  bonus_trace_5: boolean;
  bonus_trace_6: boolean;
  total: number | null;
  observations: string | null;
}

@Injectable()
export class SupabaseScoreSuiviLigneRepository implements ScoreSuiviLigneRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: Row): ScoreSuiviLigne {
    return new ScoreSuiviLigne({
      id: row.id,
      teamId: row.team_id,
      juryId: row.jury_id,
      distancePct: row.distance_pct,
      parcoursFini: row.parcours_fini,
      tempsSecondes: row.temps_secondes,
      calcul500Temps: row.calcul_500_temps,
      bonusTrace1: row.bonus_trace_1,
      bonusTrace2: row.bonus_trace_2,
      bonusTrace3: row.bonus_trace_3,
      bonusTrace4: row.bonus_trace_4,
      bonusTrace5: row.bonus_trace_5,
      bonusTrace6: row.bonus_trace_6,
      total: row.total,
      observations: row.observations,
    });
  }

  async create(data: CreateScoreSuiviLigneData): Promise<ScoreSuiviLigne> {
    const { data: row, error } = await this.supabase
      .from('scores_suivi_ligne')
      .insert({
        team_id: data.teamId,
        jury_id: data.juryId,
        distance_pct: data.distancePct,
        parcours_fini: data.parcoursFini,
        temps_secondes: data.tempsSecondes,
        bonus_trace_1: data.bonusTrace1,
        bonus_trace_2: data.bonusTrace2,
        bonus_trace_3: data.bonusTrace3,
        bonus_trace_4: data.bonusTrace4,
        bonus_trace_5: data.bonusTrace5,
        bonus_trace_6: data.bonusTrace6,
        observations: data.observations,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating score_suivi_ligne: ${error.message} ${error.code}`);
    return this.mapToDomain(row as Row);
  }

  async getById(id: string): Promise<ScoreSuiviLigne | null> {
    const { data, error } = await this.supabase.from('scores_suivi_ligne').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching: ${error.message}`);
    }
    return this.mapToDomain(data as Row);
  }

  async update(id: string, data: UpdateScoreSuiviLigneData): Promise<ScoreSuiviLigne> {
    const payload: Record<string, unknown> = {};
    if (data.distancePct !== undefined) payload.distance_pct = data.distancePct;
    if (data.parcoursFini !== undefined) payload.parcours_fini = data.parcoursFini;
    if (data.tempsSecondes !== undefined) payload.temps_secondes = data.tempsSecondes;
    if (data.bonusTrace1 !== undefined) payload.bonus_trace_1 = data.bonusTrace1;
    if (data.bonusTrace2 !== undefined) payload.bonus_trace_2 = data.bonusTrace2;
    if (data.bonusTrace3 !== undefined) payload.bonus_trace_3 = data.bonusTrace3;
    if (data.bonusTrace4 !== undefined) payload.bonus_trace_4 = data.bonusTrace4;
    if (data.bonusTrace5 !== undefined) payload.bonus_trace_5 = data.bonusTrace5;
    if (data.bonusTrace6 !== undefined) payload.bonus_trace_6 = data.bonusTrace6;
    if (data.observations !== undefined) payload.observations = data.observations;

    const { data: row, error } = await this.supabase.from('scores_suivi_ligne').update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Error updating: ${error.message}`);
    return this.mapToDomain(row as Row);
  }
}
