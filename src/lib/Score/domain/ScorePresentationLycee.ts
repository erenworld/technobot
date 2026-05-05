export class ScorePresentationLycee {
  readonly id: string;
  readonly teamId: string;
  readonly juryId: string;
  readonly repartitionTempsParole: number;
  readonly qualiteVisuelPresentation: number;
  readonly justesseTechnique: number;
  readonly competencesLinguistiques: number;
  readonly vocabulaireTechnique: number;
  readonly dossierTechniqueLv: number;
  readonly echangesTechniques: number;
  readonly total: number | null;
  readonly observations: string | null;

  constructor(params: {
    id: string;
    teamId: string;
    juryId: string;
    repartitionTempsParole: number;
    qualiteVisuelPresentation: number;
    justesseTechnique: number;
    competencesLinguistiques: number;
    vocabulaireTechnique: number;
    dossierTechniqueLv: number;
    echangesTechniques: number;
    total: number | null;
    observations: string | null;
  }) {
    this.id = params.id;
    this.teamId = params.teamId;
    this.juryId = params.juryId;
    this.repartitionTempsParole = params.repartitionTempsParole;
    this.qualiteVisuelPresentation = params.qualiteVisuelPresentation;
    this.justesseTechnique = params.justesseTechnique;
    this.competencesLinguistiques = params.competencesLinguistiques;
    this.vocabulaireTechnique = params.vocabulaireTechnique;
    this.dossierTechniqueLv = params.dossierTechniqueLv;
    this.echangesTechniques = params.echangesTechniques;
    this.total = params.total;
    this.observations = params.observations;
  }

  toPlainObject() {
    return {
      id: this.id,
      team_id: this.teamId,
      jury_id: this.juryId,
      repartition_temps_parole: this.repartitionTempsParole,
      qualite_visuel_presentation: this.qualiteVisuelPresentation,
      justesse_technique: this.justesseTechnique,
      competences_linguistiques: this.competencesLinguistiques,
      vocabulaire_technique: this.vocabulaireTechnique,
      dossier_technique_lv: this.dossierTechniqueLv,
      echanges_techniques: this.echangesTechniques,
      total: this.total,
      observations: this.observations,
    };
  }
}
