export class ScoreDesign {
  readonly id: string;
  readonly teamId: string;
  readonly juryId: string;
  readonly accessInterrupteur: number;
  readonly refroidCarte: number;
  readonly acesCableProg: number;
  readonly facilitePiles: number;
  readonly solidite: number;
  readonly homogeneite: number;
  readonly oeuvreOriginale: number;
  readonly qualiteVisuelle: number;
  readonly dissimulationPieces: number;
  readonly qualiteAffiche: number;
  readonly qualiteEchange: number;
  readonly bonusSuiviOvale: boolean;
  readonly bonusConnecte: boolean;
  readonly total: number | null;
  readonly observations: string | null;

  constructor(params: {
    id: string;
    teamId: string;
    juryId: string;
    accessInterrupteur: number;
    refroidCarte: number;
    acesCableProg: number;
    facilitePiles: number;
    solidite: number;
    homogeneite: number;
    oeuvreOriginale: number;
    qualiteVisuelle: number;
    dissimulationPieces: number;
    qualiteAffiche: number;
    qualiteEchange: number;
    bonusSuiviOvale: boolean;
    bonusConnecte: boolean;
    total: number | null;
    observations: string | null;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.juryId = params.juryId;
    this.accessInterrupteur = params.accessInterrupteur;
    this.refroidCarte = params.refroidCarte;
    this.acesCableProg = params.acesCableProg;
    this.facilitePiles = params.facilitePiles;
    this.solidite = params.solidite;
    this.homogeneite = params.homogeneite;
    this.oeuvreOriginale = params.oeuvreOriginale;
    this.qualiteVisuelle = params.qualiteVisuelle;
    this.dissimulationPieces = params.dissimulationPieces;
    this.qualiteAffiche = params.qualiteAffiche;
    this.qualiteEchange = params.qualiteEchange;
    this.bonusSuiviOvale = params.bonusSuiviOvale;
    this.bonusConnecte = params.bonusConnecte;
    this.total = params.total;
    this.observations = params.observations;
  }

  toPlainObject() {
    return {
      id: this.id,
      team_id: this.teamId,
      jury_id: this.juryId,
      access_interrupteur: this.accessInterrupteur,
      refroid_carte: this.refroidCarte,
      acces_cable_prog: this.acesCableProg,
      facilite_piles: this.facilitePiles,
      solidite: this.solidite,
      homogeneite: this.homogeneite,
      oeuvre_originale: this.oeuvreOriginale,
      qualite_visuelle: this.qualiteVisuelle,
      dissimulation_pieces: this.dissimulationPieces,
      qualite_affiche: this.qualiteAffiche,
      qualite_echange: this.qualiteEchange,
      bonus_suivi_ovale: this.bonusSuiviOvale,
      bonus_connecte: this.bonusConnecte,
      total: this.total,
      observations: this.observations,
    };
  }
}
