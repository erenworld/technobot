export type Role = 'admin' | 'organisateur' | 'jury' | 'enseignant' | 'eleve';

export type Permission =
  | 'read:teams'
  | 'manage:teams'
  | 'validate:controle_technique'
  | 'read:scores'
  | 'create:scores'
  | 'update:own_scores'
  | 'read:planning'
  | 'manage:planning'
  | 'read:matchs'
  | 'manage:matchs'
  | 'create:rencontre'
  | 'read:classements'
  | 'read:users'
  | 'manage:own_profile'
  | 'manage:all_profiles'
  | 'delete:profile';

export type Categorie = 'college' | 'lycee';

export type Epreuve =
  | 'sumo'
  | 'suivi_ligne'
  | 'formule_robot'
  | 'design'
  | 'presentation_projet';

export type StatutTeam =
  | 'inscrit'
  | 'valide'
  | 'controle_technique_ok'
  | 'disqualifie';

export type Profile = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  discipline?: string | null;
  etablissement_id?: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  edition_id: string;
  etablissement_id?: string | null;
  immatriculation: string;
  nom_robot: string;
  /** Résolu côté front depuis la table `etablissements`. */
  etablissement?: string;
  categorie: Categorie;
  epreuve: Epreuve;
  statut: StatutTeam;
  poids_g?: number | null;
  dimension_lxl?: string | null;
  cout_ht?: number | null;
  notes_technique?: string | null;
  description?: string | null;
};

export type Etablissement = {
  id: string;
  nom: string;
  type: string;
  ville: string | null;
  code_postal: string | null;
  contact_nom: string | null;
  contact_email: string | null;
  contact_tel: string | null;
  logo_url: string | null;
};

export type ControleTechniquePayload = {
  statut: 'inscrit' | 'controle_technique_ok' | 'disqualifie';
  notes_technique?: string | null;
};

export type ClassementCollegeEntry = {
  rang: number;
  team_id: string;
  immatriculation: string;
  nom_robot: string;
  etablissement: string;
  total_points: number;
  detail_scores: {
    design?: number;
    presentation?: number;
    suivi_ligne?: number;
    formule_robot?: number;
  };
};

export type ClassementLyceeEntry = {
  rang: number;
  team_id: string;
  immatriculation: string;
  nom_robot: string;
  etablissement: string;
  total_points: number;
  detail_scores: {
    presentation_lycee?: number;
    points_rencontres_sumo?: number;
  };
};

export type Classements = {
  colleges: ClassementCollegeEntry[];
  lycees: ClassementLyceeEntry[];
};

export type PlanningSlot = {
  id: string;
  team_id: string | null;
  epreuve_id: string | null;
  poule?: string | null;
  jury_vestiaire?: string | null;
  heure_presentation?: string | null;
  heure_debut_rencontres?: string | null;
  heure_fin_rencontres?: string | null;
  zone_rencontres?: string | null;
  salle_presentation?: string | null;
  observations?: string | null;
  created_at?: string | null;
};

export type EpreuveDB = {
  id: string;
  edition_id: string | null;
  nom: string;
  type: string;
  categorie: string | null;
  description: string | null;
  created_at: string | null;
};

export type MatchSumoStatut = 'a_venir' | 'en_cours' | 'termine';

export type MatchSumo = {
  id: string;
  edition_id: string;
  poule: string;
  zone: string;
  team_a_id: string;
  team_b_id: string;
  statut: MatchSumoStatut;
  rencontres?: RencontreSumo[];
};

export type RencontreSumo = {
  id: string;
  match_id: string;
  numero_manche: number;
  vainqueur_team_id: string | null;
  yuko_a: number;
  yuko_b: number;
};
