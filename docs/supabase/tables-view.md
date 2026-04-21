## Table `audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `table_name` | `text` |  |
| `record_id` | `uuid` |  |
| `action` | `text` |  Nullable |
| `old_values` | `jsonb` |  Nullable |
| `new_values` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `editions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `annee` | `int4` |  Unique |
| `date_finale` | `date` |  |
| `lieu` | `text` |  Nullable |
| `statut` | `text` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `epreuves`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `edition_id` | `uuid` |  Nullable |
| `nom` | `text` |  |
| `type` | `text` |  |
| `categorie` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `etablissements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nom` | `text` |  |
| `type` | `text` |  |
| `ville` | `text` |  |
| `contact_nom` | `text` |  Nullable |
| `contact_email` | `text` |  Nullable |
| `contact_tel` | `text` |  Nullable |
| `logo_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `jury_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `epreuve_id` | `uuid` |  Nullable |
| `vestiaire` | `text` |  Nullable |
| `role_jury` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `matchs_sumo`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `edition_id` | `uuid` |  Nullable |
| `epreuve_id` | `uuid` |  Nullable |
| `team_a_id` | `uuid` |  Nullable |
| `team_b_id` | `uuid` |  Nullable |
| `poule` | `text` |  Nullable |
| `zone` | `text` |  Nullable |
| `heure_debut` | `time` |  Nullable |
| `statut` | `text` |  Nullable |
| `vainqueur_team_id` | `uuid` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `profile_id` | `uuid` |  Nullable |
| `titre` | `text` |  |
| `message` | `text` |  |
| `type` | `text` |  Nullable |
| `lu` | `bool` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `planning_slots`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `epreuve_id` | `uuid` |  Nullable |
| `poule` | `text` |  Nullable |
| `jury_vestiaire` | `text` |  Nullable |
| `heure_presentation` | `time` |  Nullable |
| `heure_debut_rencontres` | `time` |  Nullable |
| `heure_fin_rencontres` | `time` |  Nullable |
| `zone_rencontres` | `text` |  Nullable |
| `salle_presentation` | `text` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `auth_user_id` | `uuid` |  Nullable Unique |
| `nom` | `text` |  |
| `prenom` | `text` |  |
| `email` | `text` |  Unique |
| `role` | `text` |  |
| `etablissement_id` | `uuid` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `rencontres_sumo`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `match_id` | `uuid` |  Nullable |
| `numero_rencontre` | `int2` |  Nullable |
| `vainqueur_id` | `uuid` |  Nullable |
| `yuko_a` | `int2` |  Nullable |
| `yuko_b` | `int2` |  Nullable |
| `yusei_a` | `int2` |  Nullable |
| `yusei_b` | `int2` |  Nullable |
| `configuration_depart` | `text` |  Nullable |
| `duree_secondes` | `int4` |  Nullable |
| `annulee` | `bool` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `scores_design`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `jury_id` | `uuid` |  Nullable |
| `access_interrupteur` | `int2` |  Nullable |
| `refroid_carte` | `int2` |  Nullable |
| `acces_cable_prog` | `int2` |  Nullable |
| `facilite_piles` | `int2` |  Nullable |
| `solidite` | `int2` |  Nullable |
| `homogeneite` | `int2` |  Nullable |
| `oeuvre_originale` | `int2` |  Nullable |
| `qualite_visuelle` | `int2` |  Nullable |
| `dissimulation_pieces` | `int2` |  Nullable |
| `qualite_affiche` | `int2` |  Nullable |
| `qualite_echange` | `int2` |  Nullable |
| `bonus_suivi_ovale` | `bool` |  Nullable |
| `bonus_connecte` | `bool` |  Nullable |
| `total` | `int2` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `scores_presentation_colleges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `jury_id` | `uuid` |  Nullable |
| `aisance` | `int2` |  Nullable |
| `langues` | `int2` |  Nullable |
| `contenu` | `int2` |  Nullable |
| `outils` | `int2` |  Nullable |
| `bonus_suivi_ovale` | `bool` |  Nullable |
| `bonus_connecte` | `bool` |  Nullable |
| `total` | `int2` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `scores_presentation_lycees`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `jury_id` | `uuid` |  Nullable |
| `repartition_temps_parole` | `int2` |  Nullable |
| `qualite_visuel_presentation` | `int2` |  Nullable |
| `justesse_technique` | `int2` |  Nullable |
| `competences_linguistiques` | `int2` |  Nullable |
| `vocabulaire_technique` | `int2` |  Nullable |
| `dossier_technique_lv` | `int2` |  Nullable |
| `echanges_techniques` | `int2` |  Nullable |
| `total` | `int2` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `scores_suivi_ligne`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `jury_id` | `uuid` |  Nullable |
| `distance_pct` | `int2` |  Nullable |
| `parcours_fini` | `bool` |  Nullable |
| `temps_secondes` | `numeric` |  Nullable |
| `calcul_500_temps` | `numeric` |  Nullable |
| `bonus_trace_1` | `bool` |  Nullable |
| `bonus_trace_2` | `bool` |  Nullable |
| `bonus_trace_3` | `bool` |  Nullable |
| `bonus_trace_4` | `bool` |  Nullable |
| `bonus_trace_5` | `bool` |  Nullable |
| `bonus_trace_6` | `bool` |  Nullable |
| `total` | `numeric` |  Nullable |
| `observations` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `team_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `team_id` | `uuid` |  Nullable |
| `profile_id` | `uuid` |  Nullable |
| `role_dans_equipe` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `teams`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `edition_id` | `uuid` |  Nullable |
| `etablissement_id` | `uuid` |  Nullable |
| `immatriculation` | `text` |  Unique |
| `nom_robot` | `text` |  Nullable |
| `categorie` | `text` |  |
| `epreuve` | `text` |  |
| `statut` | `text` |  |
| `poids_g` | `int4` |  Nullable |
| `dimension_lxl` | `text` |  Nullable |
| `cout_ht` | `numeric` |  Nullable |
| `notes_technique` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  |
| `email` | `text` |  |
| `createdAt` | `timestamp` |  |

