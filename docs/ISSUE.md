# Issue: Implémentation des Mentions Légales, CGU et Politique de Confidentialité Conformes au RGPD

## Problématique

La plateforme TechnoBot, dédiée à l'organisation du tournoi de robotique scolaire, ne disposait pas d'une politique de confidentialité et de conditions générales d'utilisation (CGU) accessibles. De plus, pour respecter la législation sur la protection des données personnelles (RGPD) et les directives de la CNIL, plusieurs exigences manquaient :
- Information transparente sur l'hébergement des données (OVH et Supabase).
- Mention claire des coordonnées de contact et du responsable de traitement (Arnaud Roesslinger).
- Procédure de double consentement pour les mineurs de moins de 15 ans lors des inscriptions scolaires.
- Information sur les transferts hors-UE (Supabase / AWS) via les Clauses Contractuelles Types (CCT).

## Solution Proposée

1.  **Création de la page légale** :
    - Implémenter une page dédiée `/cgu-confidentialite` regroupant les CGU et la Politique de Confidentialité.
    - Utiliser le style premium à double colonne existant avec sommaire interactif gauche (TOC) pour naviguer de façon fluide entre les 15 articles.
    - Intégrer les mentions obligatoires : hébergement, DPA/CCT de Supabase, droits des utilisateurs (accès, effacement, CNIL) et coordonnées e-mail.

2.  **Accessibilité et Pied de page** :
    - Ajouter un lien d'accès direct "CGU & Politique de Confidentialité" au bas de la liste de navigation de la page d'accueil dans le composant `Footer`.
    - Harmoniser le lien dans les pieds de page compacts et scoreboard.

3.  **Renforcement de la conformité sur l'inscription** :
    - Insérer une mention légale claire sous le résumé de l'Étape 04 du formulaire d'inscription liant explicitement la soumission de l'inscription à la lecture et l'acceptation de ces chartes.
    - Ajouter des astérisques rouges (`*`) stylisés aux 4 cases à cocher requises pour la validation de la Charte afin de renforcer la clarté du formulaire.

## Objectifs
- [x] Créer le composant `LegalPage` avec les 15 articles et le sommaire dynamique
- [x] Intégrer les liens d'accès dans les trois composants de pied de page
- [x] Ajouter la mention légale d'information sur la page d'inscription
- [x] Ajouter des astérisques rouges aux engagements requis de la charte
- [x] Garantir qu'aucun tiret cadratin (`—`) n'est présent dans le texte
- [x] Enregistrer la route `/cgu-confidentialite` dans le routeur principal
