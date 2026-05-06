export class ScoreSuiviLigne {
  readonly id: string;
  readonly teamId: string;
  readonly juryId: string;
  readonly distancePct: number;
  readonly parcoursFini: boolean;
  readonly tempsSecondes: number | null;
  readonly calcul500Temps: number | null;
  readonly bonusTrace1: boolean;
  readonly bonusTrace2: boolean;
  readonly bonusTrace3: boolean;
  readonly bonusTrace4: boolean;
  readonly bonusTrace5: boolean;
  readonly bonusTrace6: boolean;
  readonly total: number | null;
  readonly observations: string | null;

  constructor(params: {
    id: string;
    teamId: string;
    juryId: string;
    distancePct: number;
    parcoursFini: boolean;
    tempsSecondes: number | null;
    calcul500Temps: number | null;
    bonusTrace1: boolean;
    bonusTrace2: boolean;
    bonusTrace3: boolean;
    bonusTrace4: boolean;
    bonusTrace5: boolean;
    bonusTrace6: boolean;
    total: number | null;
    observations: string | null;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.juryId = params.juryId;
    this.distancePct = params.distancePct;
    this.parcoursFini = params.parcoursFini;
    this.tempsSecondes = params.tempsSecondes;
    this.calcul500Temps = params.calcul500Temps;
    this.bonusTrace1 = params.bonusTrace1;
    this.bonusTrace2 = params.bonusTrace2;
    this.bonusTrace3 = params.bonusTrace3;
    this.bonusTrace4 = params.bonusTrace4;
    this.bonusTrace5 = params.bonusTrace5;
    this.bonusTrace6 = params.bonusTrace6;
    this.total = params.total;
    this.observations = params.observations;
  }

  toPlainObject() {
    return {
      id: this.id,
      team_id: this.teamId,
      jury_id: this.juryId,
      distance_pct: this.distancePct,
      parcours_fini: this.parcoursFini,
      temps_secondes: this.tempsSecondes,
      calcul_500_temps: this.calcul500Temps,
      bonus_trace_1: this.bonusTrace1,
      bonus_trace_2: this.bonusTrace2,
      bonus_trace_3: this.bonusTrace3,
      bonus_trace_4: this.bonusTrace4,
      bonus_trace_5: this.bonusTrace5,
      bonus_trace_6: this.bonusTrace6,
      total: this.total,
      observations: this.observations,
    };
  }
}
