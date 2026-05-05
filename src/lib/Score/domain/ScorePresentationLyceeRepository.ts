import { ScorePresentationLycee } from './ScorePresentationLycee';

export interface CreateScorePresentationLyceeData {
  readonly teamId: string;
  readonly juryId: string;
  readonly repartitionTempsParole: number;
  readonly qualiteVisuelPresentation: number;
  readonly justesseTechnique: number;
  readonly competencesLinguistiques: number;
  readonly vocabulaireTechnique: number;
  readonly dossierTechniqueLv: number;
  readonly echangesTechniques: number;
  readonly observations: string | null;
}

export interface UpdateScorePresentationLyceeData {
  readonly repartitionTempsParole?: number;
  readonly qualiteVisuelPresentation?: number;
  readonly justesseTechnique?: number;
  readonly competencesLinguistiques?: number;
  readonly vocabulaireTechnique?: number;
  readonly dossierTechniqueLv?: number;
  readonly echangesTechniques?: number;
  readonly observations?: string | null;
}

export interface ScorePresentationLyceeRepository {
  create(data: CreateScorePresentationLyceeData): Promise<ScorePresentationLycee>;
  getById(id: string): Promise<ScorePresentationLycee | null>;
  update(id: string, data: UpdateScorePresentationLyceeData): Promise<ScorePresentationLycee>;
}
