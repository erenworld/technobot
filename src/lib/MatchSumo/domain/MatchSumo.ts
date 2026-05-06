export type MatchSumoStatutValue = 'planifie' | 'en_cours' | 'termine';

export class MatchSumo {
  readonly id: string;
  readonly editionId: string | null;
  readonly epreuveId: string | null;
  readonly teamAId: string | null;
  readonly teamBId: string | null;
  readonly poule: string | null;
  readonly zone: string | null;
  readonly heureDebut: string | null;
  readonly statut: MatchSumoStatutValue | null;
  readonly vainqueurTeamId: string | null;
  readonly observations: string | null;
  readonly rencontres: RencontreSumo[];

  constructor(params: {
    id: string;
    editionId: string | null;
    epreuveId: string | null;
    teamAId: string | null;
    teamBId: string | null;
    poule: string | null;
    zone: string | null;
    heureDebut: string | null;
    statut: MatchSumoStatutValue | null;
    vainqueurTeamId: string | null;
    observations: string | null;
    rencontres: RencontreSumo[];
  }) {
    this.id = params.id;
    this.editionId = params.editionId;
    this.epreuveId = params.epreuveId;
    this.teamAId = params.teamAId;
    this.teamBId = params.teamBId;
    this.poule = params.poule;
    this.zone = params.zone;
    this.heureDebut = params.heureDebut;
    this.statut = params.statut;
    this.vainqueurTeamId = params.vainqueurTeamId;
    this.observations = params.observations;
    this.rencontres = params.rencontres;
  }

  isFinished(): boolean {
    return this.statut === 'termine';
  }

  toPlainObject() {
    return {
      id: this.id,
      edition_id: this.editionId,
      epreuve_id: this.epreuveId,
      team_a_id: this.teamAId,
      team_b_id: this.teamBId,
      poule: this.poule,
      zone: this.zone,
      heure_debut: this.heureDebut,
      statut: this.statut,
      vainqueur_team_id: this.vainqueurTeamId,
      observations: this.observations,
      rencontres: this.rencontres.map((r) => r.toPlainObject()),
    };
  }
}

export type ConfigurationDepartValue = 'face_a_face' | 'dos_a_dos' | 'flanc_droit' | 'flanc_gauche';

export class RencontreSumo {
  readonly id: string;
  readonly matchId: string;
  readonly numeroRencontre: number;
  readonly vainqueurId: string | null;
  readonly yukoA: number;
  readonly yukoB: number;
  readonly yuseiA: number;
  readonly yuseiB: number;
  readonly configurationDepart: ConfigurationDepartValue;
  readonly dureeSecondes: number | null;
  readonly annulee: boolean;
  readonly observations: string | null;

  constructor(params: {
    id: string;
    matchId: string;
    numeroRencontre: number;
    vainqueurId: string | null;
    yukoA: number;
    yukoB: number;
    yuseiA: number;
    yuseiB: number;
    configurationDepart: ConfigurationDepartValue;
    dureeSecondes: number | null;
    annulee: boolean;
    observations: string | null;
  }) {
    this.id = params.id;
    this.matchId = params.matchId;
    this.numeroRencontre = params.numeroRencontre;
    this.vainqueurId = params.vainqueurId;
    this.yukoA = params.yukoA;
    this.yukoB = params.yukoB;
    this.yuseiA = params.yuseiA;
    this.yuseiB = params.yuseiB;
    this.configurationDepart = params.configurationDepart;
    this.dureeSecondes = params.dureeSecondes;
    this.annulee = params.annulee;
    this.observations = params.observations;
  }

  toPlainObject() {
    return {
      id: this.id,
      match_id: this.matchId,
      numero_rencontre: this.numeroRencontre,
      vainqueur_id: this.vainqueurId,
      yuko_a: this.yukoA,
      yuko_b: this.yukoB,
      yusei_a: this.yuseiA,
      yusei_b: this.yuseiB,
      configuration_depart: this.configurationDepart,
      duree_secondes: this.dureeSecondes,
      annulee: this.annulee,
      observations: this.observations,
    };
  }
}
