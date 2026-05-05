export class ScorePresentationCollege {
  readonly id: string;
  readonly teamId: string;
  readonly juryId: string;
  readonly aisance: number;
  readonly langues: number;
  readonly contenu: number;
  readonly outils: number;
  readonly bonusSuiviOvale: boolean;
  readonly bonusConnecte: boolean;
  readonly total: number | null;
  readonly observations: string | null;

  constructor(params: {
    id: string;
    teamId: string;
    juryId: string;
    aisance: number;
    langues: number;
    contenu: number;
    outils: number;
    bonusSuiviOvale: boolean;
    bonusConnecte: boolean;
    total: number | null;
    observations: string | null;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.juryId = params.juryId;
    this.aisance = params.aisance;
    this.langues = params.langues;
    this.contenu = params.contenu;
    this.outils = params.outils;
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
      aisance: this.aisance,
      langues: this.langues,
      contenu: this.contenu,
      outils: this.outils,
      bonus_suivi_ovale: this.bonusSuiviOvale,
      bonus_connecte: this.bonusConnecte,
      total: this.total,
      observations: this.observations,
    };
  }
}
