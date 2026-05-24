import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import {
  ScoreDesignRepository,
  CreateScoreDesignData,
  UpdateScoreDesignData,
} from '../../domain/ScoreDesignRepository';
import { ScoreDesign } from '../../domain/ScoreDesign';

interface ScoreDesignRow {
  id: string;
  team_id: string;
  jury_id: string;
  access_interrupteur: number;
  refroid_carte: number;
  acces_cable_prog: number;
  facilite_piles: number;
  solidite: number;
  homogeneite: number;
  oeuvre_originale: number;
  qualite_visuelle: number;
  dissimulation_pieces: number;
  qualite_affiche: number;
  qualite_echange: number;
  bonus_suivi_ovale: boolean;
  bonus_connecte: boolean;
  total: number | null;
  observations: string | null;
}

@Injectable()
export class SupabaseScoreDesignRepository implements ScoreDesignRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: ScoreDesignRow): ScoreDesign {
    return new ScoreDesign({
      id: row.id,
      teamId: row.team_id,
      juryId: row.jury_id,
      accessInterrupteur: row.access_interrupteur,
      refroidCarte: row.refroid_carte,
      acesCableProg: row.acces_cable_prog,
      facilitePiles: row.facilite_piles,
      solidite: row.solidite,
      homogeneite: row.homogeneite,
      oeuvreOriginale: row.oeuvre_originale,
      qualiteVisuelle: row.qualite_visuelle,
      dissimulationPieces: row.dissimulation_pieces,
      qualiteAffiche: row.qualite_affiche,
      qualiteEchange: row.qualite_echange,
      bonusSuiviOvale: row.bonus_suivi_ovale,
      bonusConnecte: row.bonus_connecte,
      total: row.total,
      observations: row.observations,
    });
  }

  async create(data: CreateScoreDesignData): Promise<ScoreDesign> {
    const { data: row, error } = await this.supabase
      .from('scores_design')
      .insert({
        team_id: data.teamId,
        jury_id: data.juryId,
        access_interrupteur: data.accessInterrupteur,
        refroid_carte: data.refroidCarte,
        acces_cable_prog: data.acesCableProg,
        facilite_piles: data.facilitePiles,
        solidite: data.solidite,
        homogeneite: data.homogeneite,
        oeuvre_originale: data.oeuvreOriginale,
        qualite_visuelle: data.qualiteVisuelle,
        dissimulation_pieces: data.dissimulationPieces,
        qualite_affiche: data.qualiteAffiche,
        qualite_echange: data.qualiteEchange,
        bonus_suivi_ovale: data.bonusSuiviOvale,
        bonus_connecte: data.bonusConnecte,
        observations: data.observations,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating score_design: ${error.message} ${error.code}`);
    return this.mapToDomain(row as ScoreDesignRow);
  }

  async getById(id: string): Promise<ScoreDesign | null> {
    const { data, error } = await this.supabase
      .from('scores_design')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching score_design: ${error.message}`);
    }
    return this.mapToDomain(data as ScoreDesignRow);
  }

  async update(id: string, data: UpdateScoreDesignData): Promise<ScoreDesign> {
    const updatePayload: Record<string, unknown> = {};
    if (data.accessInterrupteur !== undefined) updatePayload.access_interrupteur = data.accessInterrupteur;
    if (data.refroidCarte !== undefined) updatePayload.refroid_carte = data.refroidCarte;
    if (data.acesCableProg !== undefined) updatePayload.acces_cable_prog = data.acesCableProg;
    if (data.facilitePiles !== undefined) updatePayload.facilite_piles = data.facilitePiles;
    if (data.solidite !== undefined) updatePayload.solidite = data.solidite;
    if (data.homogeneite !== undefined) updatePayload.homogeneite = data.homogeneite;
    if (data.oeuvreOriginale !== undefined) updatePayload.oeuvre_originale = data.oeuvreOriginale;
    if (data.qualiteVisuelle !== undefined) updatePayload.qualite_visuelle = data.qualiteVisuelle;
    if (data.dissimulationPieces !== undefined) updatePayload.dissimulation_pieces = data.dissimulationPieces;
    if (data.qualiteAffiche !== undefined) updatePayload.qualite_affiche = data.qualiteAffiche;
    if (data.qualiteEchange !== undefined) updatePayload.qualite_echange = data.qualiteEchange;
    if (data.bonusSuiviOvale !== undefined) updatePayload.bonus_suivi_ovale = data.bonusSuiviOvale;
    if (data.bonusConnecte !== undefined) updatePayload.bonus_connecte = data.bonusConnecte;
    if (data.observations !== undefined) updatePayload.observations = data.observations;

    const { data: row, error } = await this.supabase
      .from('scores_design')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error updating score_design: ${error.message}`);
    return this.mapToDomain(row as ScoreDesignRow);
  }
}
