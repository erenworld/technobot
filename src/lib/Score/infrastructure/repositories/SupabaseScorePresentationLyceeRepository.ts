import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { ScorePresentationLyceeRepository, CreateScorePresentationLyceeData, UpdateScorePresentationLyceeData } from '../../domain/ScorePresentationLyceeRepository';
import { ScorePresentationLycee } from '../../domain/ScorePresentationLycee';

interface Row {
  id: string;
  team_id: string;
  jury_id: string;
  repartition_temps_parole: number;
  qualite_visuel_presentation: number;
  justesse_technique: number;
  competences_linguistiques: number;
  vocabulaire_technique: number;
  dossier_technique_lv: number;
  echanges_techniques: number;
  total: number | null;
  observations: string | null;
}

@Injectable()
export class SupabaseScorePresentationLyceeRepository implements ScorePresentationLyceeRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private mapToDomain(row: Row): ScorePresentationLycee {
    return new ScorePresentationLycee({
      id: row.id,
      teamId: row.team_id,
      juryId: row.jury_id,
      repartitionTempsParole: row.repartition_temps_parole,
      qualiteVisuelPresentation: row.qualite_visuel_presentation,
      justesseTechnique: row.justesse_technique,
      competencesLinguistiques: row.competences_linguistiques,
      vocabulaireTechnique: row.vocabulaire_technique,
      dossierTechniqueLv: row.dossier_technique_lv,
      echangesTechniques: row.echanges_techniques,
      total: row.total,
      observations: row.observations,
    });
  }

  async create(data: CreateScorePresentationLyceeData): Promise<ScorePresentationLycee> {
    const { data: row, error } = await this.supabase
      .from('scores_presentation_lycees')
      .insert({
        team_id: data.teamId,
        jury_id: data.juryId,
        repartition_temps_parole: data.repartitionTempsParole,
        qualite_visuel_presentation: data.qualiteVisuelPresentation,
        justesse_technique: data.justesseTechnique,
        competences_linguistiques: data.competencesLinguistiques,
        vocabulaire_technique: data.vocabulaireTechnique,
        dossier_technique_lv: data.dossierTechniqueLv,
        echanges_techniques: data.echangesTechniques,
        observations: data.observations,
      })
      .select()
      .single();

    if (error) throw new Error(`Error creating score_presentation_lycee: ${error.message} ${error.code}`);
    return this.mapToDomain(row as Row);
  }

  async getById(id: string): Promise<ScorePresentationLycee | null> {
    const { data, error } = await this.supabase.from('scores_presentation_lycees').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching: ${error.message}`);
    }
    return this.mapToDomain(data as Row);
  }

  async update(id: string, data: UpdateScorePresentationLyceeData): Promise<ScorePresentationLycee> {
    const payload: Record<string, unknown> = {};
    if (data.repartitionTempsParole !== undefined) payload.repartition_temps_parole = data.repartitionTempsParole;
    if (data.qualiteVisuelPresentation !== undefined) payload.qualite_visuel_presentation = data.qualiteVisuelPresentation;
    if (data.justesseTechnique !== undefined) payload.justesse_technique = data.justesseTechnique;
    if (data.competencesLinguistiques !== undefined) payload.competences_linguistiques = data.competencesLinguistiques;
    if (data.vocabulaireTechnique !== undefined) payload.vocabulaire_technique = data.vocabulaireTechnique;
    if (data.dossierTechniqueLv !== undefined) payload.dossier_technique_lv = data.dossierTechniqueLv;
    if (data.echangesTechniques !== undefined) payload.echanges_techniques = data.echangesTechniques;
    if (data.observations !== undefined) payload.observations = data.observations;

    const { data: row, error } = await this.supabase.from('scores_presentation_lycees').update(payload).eq('id', id).select().single();
    if (error) throw new Error(`Error updating: ${error.message}`);
    return this.mapToDomain(row as Row);
  }
}
