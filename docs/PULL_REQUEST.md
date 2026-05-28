## Résumé

Cette PR introduit les **Conditions Générales d'Utilisation et la Politique de Confidentialité** (conforme RGPD / CNIL) de la plateforme TechnoBot 2026. Elle ajoute les accès nécessaires sur tous les pieds de page et renforce le parcours d'inscription avec une mention légale d'information et des indicateurs visuels (astérisques rouges) sur les formulaires requis.

## Changements

### Mentions Légales & RGPD
- **Page CGU & Politique de Confidentialité** : Création de la route `/cgu-confidentialite` pointant sur la nouvelle page [LegalPage.tsx](file:///c:/dev/Technobot/web/src/routes/LegalPage.tsx) qui intègre les 15 articles détaillés avec navigation par ancrage fluide.
- **Conformité stricte** : Intégration de l'e-mail officiel (`arnaud.roesslinger@ac-nancy-metz.fr`), des garanties contractuelles (DPA et CCT de Supabase), et du rappel de conservation du double consentement pour les moins de 15 ans.
- **Correction typographique** : Retrait systématique de tous les tirets cadratins (`—`) remplacés par des tirets classiques.

### Interface & Accessibilité
- **Pieds de page** : Ajout du lien d'accès légal dans `Footer`, `FooterCompact`, et `FooterScoreboard` de manière discrète et esthétique sous la navigation.
- **Formulaire d'inscription** : Ajout de la mention légale d'information en bas de l'Étape 04 de [InscriptionPage.tsx](file:///c:/dev/Technobot/web/src/routes/InscriptionPage.tsx).
- **Astérisques de validation** : Préfixation en rouge des 4 libellés de la Charte avec `var(--red)` pour indiquer clairement l'obligation de les cocher.

## Vérification

- [x] Intégration visuelle et responsive testée
- [x] Liens de navigation et ancrages fonctionnels
- [x] Aucun tiret cadratin (`—`) dans l'ensemble des fichiers édités
