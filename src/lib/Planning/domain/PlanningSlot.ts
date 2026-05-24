export class PlanningSlot {
  readonly id: string;
  readonly teamId: string | null;
  readonly epreuveId: string | null;
  readonly poule: string | null;
  readonly juryVestiaire: string | null;
  readonly heurePresentation: string | null;
  readonly heureDebutRencontres: string | null;
  readonly heureFinRencontres: string | null;
  readonly zoneRencontres: string | null;
  readonly sallePresentation: string | null;
  readonly observations: string | null;
  readonly team: PlanningSlotTeam | null;

  constructor(params: {
    id: string;
    teamId: string | null;
    epreuveId: string | null;
    poule: string | null;
    juryVestiaire: string | null;
    heurePresentation: string | null;
    heureDebutRencontres: string | null;
    heureFinRencontres: string | null;
    zoneRencontres: string | null;
    sallePresentation: string | null;
    observations: string | null;
    team: PlanningSlotTeam | null;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.epreuveId = params.epreuveId;
    this.poule = params.poule;
    this.juryVestiaire = params.juryVestiaire;
    this.heurePresentation = params.heurePresentation;
    this.heureDebutRencontres = params.heureDebutRencontres;
    this.heureFinRencontres = params.heureFinRencontres;
    this.zoneRencontres = params.zoneRencontres;
    this.sallePresentation = params.sallePresentation;
    this.observations = params.observations;
    this.team = params.team;
  }

  toPlainObject() {
    return {
      id: this.id,
      team_id: this.teamId,
      epreuve_id: this.epreuveId,
      poule: this.poule,
      jury_vestiaire: this.juryVestiaire,
      heure_presentation: this.heurePresentation,
      heure_debut_rencontres: this.heureDebutRencontres,
      heure_fin_rencontres: this.heureFinRencontres,
      zone_rencontres: this.zoneRencontres,
      salle_presentation: this.sallePresentation,
      observations: this.observations,
      team: this.team,
    };
  }
}

export interface PlanningSlotTeam {
  id: string;
  immatriculation: string;
  nom_robot: string | null;
  categorie: string;
  epreuve: string;
  statut: string;
}
