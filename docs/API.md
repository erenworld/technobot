# Documentation API TechnoBot

Cette documentation détaille les points d'entrée de l'API, les méthodes HTTP, les permissions requises et les structures de données.

## Authentification

L'API utilise Supabase Auth. Toutes les requêtes (sauf mention contraire) doivent inclure un jeton JWT valide.

Header requis :
Authorization: Bearer <JWT_TOKEN>

## Système de Permissions

L'accès aux ressources est géré par des permissions granulaires associées aux rôles des utilisateurs.

### Matrice des Rôles et Permissions

| Rôle | Permissions associées |
| :--- | :--- |
| admin | Toutes les permissions (Accès total) |
| organisateur | read:teams, manage:teams, validate:controle_technique, read:scores, read:planning, manage:planning, read:matchs, manage:matchs, create:rencontre, read:classements, read:users, manage:own_profile |
| jury | read:teams, read:scores, create:scores, update:own_scores, read:planning, read:matchs, create:rencontre, read:classements, manage:own_profile |
| enseignant | read:teams, read:scores, read:planning, read:matchs, read:classements, read:users, manage:own_profile |
| eleve | read:teams, read:scores, read:planning, read:matchs, read:classements, manage:own_profile |

## Module : Santé (Health)

### État du service
*   URL : /api/health
*   Méthode : GET
*   Accès : Public
*   Description : Vérifie que l'API est opérationnelle.

## Module : Équipes (Teams)

### Lister les équipes
*   URL : /api/teams
*   Méthode : GET
*   Permission : read:teams
*   Paramètres de requête (optionnels) :
    *   categorie : college, lycee
    *   epreuve : sumo, suivi_ligne, formule_robot, design, presentation_projet
    *   statut : inscrit, valide, controle_technique_ok, disqualifie
    *   edition_id : UUID de l'édition

### Récupérer une équipe
*   URL : /api/teams/:id
*   Méthode : GET
*   Permission : read:teams

### Valider le contrôle technique
*   URL : /api/teams/:id/controle-technique
*   Méthode : POST
*   Permission : validate:controle_technique
*   Corps de la requête :
    *   statut : valide, controle_technique_ok ou disqualifie
    *   notes_technique : chaine de caractères (optionnel)

## Module : Scores

### Création de scores
*   URLs : 
    *   POST /api/scores/design
    *   POST /api/scores/presentation-colleges
    *   POST /api/scores/presentation-lycees
    *   POST /api/scores/suivi-ligne
*   Permission : create:scores
*   Contrainte : Le jury_id doit correspondre à l'ID de l'utilisateur connecté.

### Modification de scores
*   URLs : 
    *   PUT /api/scores/design/:id
    *   PUT /api/scores/presentation-colleges/:id
    *   PUT /api/scores/presentation-lycees/:id
    *   PUT /api/scores/suivi-ligne/:id
*   Permission : update:own_scores
*   Contrainte : L'utilisateur ne peut modifier que les scores dont il est l'auteur.

## Module : Planning

### Consulter le planning
*   URL : /api/planning/:editionId
*   Méthode : GET
*   Permission : read:planning
*   Description : Retourne la liste complète des créneaux de passage pour une édition.

## Module : Matchs Sumo

### Lister les matchs
*   URL : /api/matchs-sumo
*   Méthode : GET
*   Permission : read:matchs
*   Paramètres de requête (optionnels) : edition_id, poule, zone, statut

### Détails d'un match
*   URL : /api/matchs-sumo/:id
*   Méthode : GET
*   Permission : read:matchs

### Ajouter une rencontre
*   URL : /api/matchs-sumo/:id/rencontres
*   Méthode : POST
*   Permission : create:rencontre
*   Description : Ajoute une manche à un match. Bloqué si le match est terminé.

## Module : Classements

### Consulter les classements
*   URL : /api/classements/:editionId
*   Méthode : GET
*   Permission : read:classements
*   Structure de la réponse :
```json
{
  "colleges": [
    {
      "rang": 1,
      "team_id": "uuid",
      "immatriculation": "DE01",
      "nom_robot": "Mega-Bolt",
      "etablissement": "College Jean Mermoz",
      "total_points": 245,
      "detail_scores": {
        "design": 98,
        "presentation": 85,
        "suivi_ligne": 62
      }
    }
  ],
  "lycees": [
    {
      "rang": 1,
      "team_id": "uuid",
      "immatriculation": "SL01",
      "nom_robot": "RoboZilla",
      "etablissement": "Lycee La Briquerie",
      "total_points": 290,
      "detail_scores": {
        "presentation_lycee": 140,
        "points_rencontres_sumo": 150
      }
    }
  ]
}
```

## Module : Utilisateurs

### Lister les utilisateurs
*   URL : /api/users
*   Méthode : GET
*   Permission : read:users

### Créer un profil
*   URL : /api/users
*   Méthode : POST
*   Permission : manage:all_profiles

### Modifier un profil
*   URL : /api/users/:id
*   Méthode : PUT
*   Permission : manage:own_profile (si id est le sien) ou manage:all_profiles (pour les autres)

### Supprimer un profil
*   URL : /api/users/:id
*   Méthode : DELETE
*   Permission : delete:profile
