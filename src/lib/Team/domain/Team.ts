import { TeamId } from './TeamId';
import { TeamStatut } from './TeamStatut';
import { TeamCategorie } from './TeamCategorie';
import { TeamEpreuve } from './TeamEpreuve';

export class Team {
  readonly id: TeamId;
  readonly immatriculation: string;
  readonly nomRobot: string | null;
  readonly categorie: TeamCategorie;
  readonly epreuve: TeamEpreuve;
  statut: TeamStatut;
  readonly etablissementId: string | null;
  readonly editionId: string | null;
  readonly poidsG: number | null;
  readonly dimensionLxl: string | null;
  readonly coutHt: number | null;
  notesTechnique: string | null;

  constructor(params: {
    id: TeamId;
    immatriculation: string;
    nomRobot: string | null;
    categorie: TeamCategorie;
    epreuve: TeamEpreuve;
    statut: TeamStatut;
    etablissementId: string | null;
    editionId: string | null;
    poidsG: number | null;
    dimensionLxl: string | null;
    coutHt: number | null;
    notesTechnique: string | null;
  }) {
    this.id = params.id;
    this.immatriculation = params.immatriculation;
    this.nomRobot = params.nomRobot;
    this.categorie = params.categorie;
    this.epreuve = params.epreuve;
    this.statut = params.statut;
    this.etablissementId = params.etablissementId;
    this.editionId = params.editionId;
    this.poidsG = params.poidsG;
    this.dimensionLxl = params.dimensionLxl;
    this.coutHt = params.coutHt;
    this.notesTechnique = params.notesTechnique;
  }

  updateControle(statut: TeamStatut, notesTechnique: string | null): void {
    this.statut = statut;
    this.notesTechnique = notesTechnique;
  }

  toPlainObject() {
    return {
      id: this.id.value,
      immatriculation: this.immatriculation,
      nom_robot: this.nomRobot,
      categorie: this.categorie.value,
      epreuve: this.epreuve.value,
      statut: this.statut.value,
      etablissement_id: this.etablissementId,
      edition_id: this.editionId,
      poids_g: this.poidsG,
      dimension_lxl: this.dimensionLxl,
      cout_ht: this.coutHt,
      notes_technique: this.notesTechnique,
    };
  }
}
