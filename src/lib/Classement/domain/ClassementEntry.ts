export interface ClassementDetailScores {
  readonly design?: number | null;
  readonly presentation?: number | null;
  readonly suivi_ligne?: number | null;
  readonly sumo_rang?: number | null;
  readonly sumo_points?: number;
}

export class ClassementEntry {
  readonly rang: number;
  readonly teamId: string;
  readonly immatriculation: string;
  readonly nomRobot: string | null;
  readonly etablissement: string | null;
  readonly totalPoints: number;
  readonly detailScores: ClassementDetailScores;

  constructor(params: {
    rang: number;
    teamId: string;
    immatriculation: string;
    nomRobot: string | null;
    etablissement: string | null;
    totalPoints: number;
    detailScores: ClassementDetailScores;
  }) {
    this.rang = params.rang;
    this.teamId = params.teamId;
    this.immatriculation = params.immatriculation;
    this.nomRobot = params.nomRobot;
    this.etablissement = params.etablissement;
    this.totalPoints = params.totalPoints;
    this.detailScores = params.detailScores;
  }

  toPlainObject() {
    return {
      rang: this.rang,
      team_id: this.teamId,
      immatriculation: this.immatriculation,
      nom_robot: this.nomRobot,
      etablissement: this.etablissement,
      total_points: this.totalPoints,
      detail_scores: this.detailScores,
    };
  }
}
