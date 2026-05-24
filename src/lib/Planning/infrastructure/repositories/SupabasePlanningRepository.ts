import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../../../common/supabase/supabase.constants';
import { PlanningRepository } from '../../domain/PlanningRepository';
import { PlanningSlot, PlanningSlotTeam } from '../../domain/PlanningSlot';

interface PlanningSlotRow {
  id: string;
  team_id: string | null;
  epreuve_id: string | null;
  poule: string | null;
  jury_vestiaire: string | null;
  heure_presentation: string | null;
  heure_debut_rencontres: string | null;
  heure_fin_rencontres: string | null;
  zone_rencontres: string | null;
  salle_presentation: string | null;
  observations: string | null;
  teams: PlanningSlotTeam | null;
}

@Injectable()
export class SupabasePlanningRepository implements PlanningRepository {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async getByEditionId(editionId: string): Promise<PlanningSlot[]> {
    const { data, error } = await this.supabase
      .from('planning_slots')
      .select(`
        id, team_id, epreuve_id, poule, jury_vestiaire,
        heure_presentation, heure_debut_rencontres, heure_fin_rencontres,
        zone_rencontres, salle_presentation, observations,
        teams (id, immatriculation, nom_robot, categorie, epreuve, statut)
      `)
      .eq('teams.edition_id', editionId);

    if (error) throw new Error(`Error fetching planning: ${error.message}`);

    return ((data as unknown) as PlanningSlotRow[]).map(
      (row) =>
        new PlanningSlot({
          id: row.id,
          teamId: row.team_id,
          epreuveId: row.epreuve_id,
          poule: row.poule,
          juryVestiaire: row.jury_vestiaire,
          heurePresentation: row.heure_presentation,
          heureDebutRencontres: row.heure_debut_rencontres,
          heureFinRencontres: row.heure_fin_rencontres,
          zoneRencontres: row.zone_rencontres,
          sallePresentation: row.salle_presentation,
          observations: row.observations,
          team: row.teams,
        }),
    );
  }
}
