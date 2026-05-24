import { Categorie, Epreuve } from '../types/api';

/**
 * Déclaration des 4 grilles de notation de la compétition.
 *
 * Chaque grille mappe 1:1 un endpoint `POST /api/scores/*` du back NestJS.
 * Les `key` correspondent EXACTEMENT aux champs attendus par les DTO côté
 * back (CreateScore*Dto) — ne pas renommer sans synchroniser avec le back.
 */

export type ScoreEndpoint =
  | 'design'
  | 'presentation-colleges'
  | 'presentation-lycees'
  | 'suivi-ligne';

/** Note discrète saisie via un sélecteur 0..max. */
export type GradeField = { kind: 'grade'; key: string; label: string; max: number };
/** Booléen (bonus, validation) saisi via une case à cocher. */
export type BoolField = { kind: 'bool'; key: string; label: string };
/** Entier borné saisi via un champ number. */
export type IntField = {
  kind: 'int';
  key: string;
  label: string;
  min: number;
  max: number;
  suffix?: string;
};
/** Nombre libre (ex. un chrono) saisi via un champ number. */
export type NumberField = { kind: 'number'; key: string; label: string; suffix?: string };

export type ScoreField = GradeField | BoolField | IntField | NumberField;

export type ScoreGroup = { title: string; fields: ScoreField[] };

export type ScoringConfig = {
  endpoint: ScoreEndpoint;
  num: string;
  title: string;
  tag: string;
  desc: string;
  /** Filtre passé à `GET /api/teams` pour ne lister que les groupes concernés. */
  teamFilter: { epreuve: Epreuve; categorie?: Categorie };
  groups: ScoreGroup[];
};

const grade = (key: string, label: string, max: number): GradeField => ({
  kind: 'grade',
  key,
  label,
  max,
});
const bonus = (key: string, label: string): BoolField => ({ kind: 'bool', key, label });

export const SCORING_CONFIGS: ScoringConfig[] = [
  {
    endpoint: 'design',
    num: '01',
    title: 'Design',
    tag: 'Collèges',
    desc: 'Ergonomie, finition et originalité du robot — 11 critères notés sur 2.',
    teamFilter: { epreuve: 'design', categorie: 'college' },
    groups: [
      {
        title: 'Conception & ergonomie',
        fields: [
          grade('access_interrupteur', "Accès à l'interrupteur", 2),
          grade('refroid_carte', 'Refroidissement de la carte', 2),
          grade('acces_cable_prog', 'Accès au câble de programmation', 2),
          grade('facilite_piles', 'Facilité de changement des piles', 2),
          grade('solidite', 'Solidité', 2),
        ],
      },
      {
        title: 'Esthétique & finition',
        fields: [
          grade('homogeneite', 'Homogénéité', 2),
          grade('oeuvre_originale', 'Œuvre originale', 2),
          grade('qualite_visuelle', 'Qualité visuelle', 2),
          grade('dissimulation_pieces', 'Dissimulation des pièces', 2),
          grade('qualite_affiche', "Qualité de l'affiche", 2),
          grade('qualite_echange', "Qualité de l'échange", 2),
        ],
      },
      {
        title: 'Bonus',
        fields: [
          bonus('bonus_suivi_ovale', 'Bonus suivi ovale'),
          bonus('bonus_connecte', 'Bonus robot connecté'),
        ],
      },
    ],
  },
  {
    endpoint: 'presentation-colleges',
    num: '02',
    title: 'Présentation de projet',
    tag: 'Collèges',
    desc: 'Soutenance orale du projet — 4 critères notés sur 4.',
    teamFilter: { epreuve: 'presentation_projet', categorie: 'college' },
    groups: [
      {
        title: 'Présentation orale',
        fields: [
          grade('aisance', "Aisance à l'oral", 4),
          grade('langues', 'Langues vivantes', 4),
          grade('contenu', 'Contenu', 4),
          grade('outils', 'Outils & supports', 4),
        ],
      },
      {
        title: 'Bonus',
        fields: [
          bonus('bonus_suivi_ovale', 'Bonus suivi ovale'),
          bonus('bonus_connecte', 'Bonus robot connecté'),
        ],
      },
    ],
  },
  {
    endpoint: 'presentation-lycees',
    num: '03',
    title: 'Présentation en langue vivante',
    tag: 'Lycées',
    desc: 'Soutenance en anglais — 7 critères notés sur 5.',
    teamFilter: { epreuve: 'presentation_projet', categorie: 'lycee' },
    groups: [
      {
        title: 'Présentation en langue vivante',
        fields: [
          grade('repartition_temps_parole', 'Répartition du temps de parole', 5),
          grade('qualite_visuel_presentation', 'Qualité du visuel de présentation', 5),
          grade('justesse_technique', 'Justesse technique', 5),
          grade('competences_linguistiques', 'Compétences linguistiques', 5),
          grade('vocabulaire_technique', 'Vocabulaire technique', 5),
          grade('dossier_technique_lv', 'Dossier technique en LV', 5),
          grade('echanges_techniques', 'Échanges techniques', 5),
        ],
      },
    ],
  },
  {
    endpoint: 'suivi-ligne',
    num: '04',
    title: 'Suivi de ligne',
    tag: 'Collèges',
    desc: 'Parcours chronométré et 6 pistes bonus.',
    teamFilter: { epreuve: 'suivi_ligne', categorie: 'college' },
    groups: [
      {
        title: 'Parcours',
        fields: [
          {
            kind: 'int',
            key: 'distance_pct',
            label: 'Distance parcourue',
            min: 0,
            max: 100,
            suffix: '%',
          },
          { kind: 'number', key: 'temps_secondes', label: 'Temps', suffix: 's' },
          bonus('parcours_fini', 'Parcours terminé'),
        ],
      },
      {
        title: 'Pistes bonus',
        fields: [
          bonus('bonus_trace_1', 'Piste bonus 1'),
          bonus('bonus_trace_2', 'Piste bonus 2'),
          bonus('bonus_trace_3', 'Piste bonus 3'),
          bonus('bonus_trace_4', 'Piste bonus 4'),
          bonus('bonus_trace_5', 'Piste bonus 5'),
          bonus('bonus_trace_6', 'Piste bonus 6'),
        ],
      },
    ],
  },
];
