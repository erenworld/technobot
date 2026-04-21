## 1. choisir les tables à suivre

par défaut, supabase ne dit rien pour économiser de la batterie (enfin, des ressources). il faut lui dire quelles tables surveiller.

1. va sur ton [dashboard supabase](https://supabase.com/dashboard).
2. clique sur la petite icône de base de données à gauche (**database**).
3. cherche la rubrique **replication**.
4. là, tu vas voir un truc qui s'appelle `supabase_realtime`. clique sur le petit bouton à droite (souvent marqué "0 tables").
5. coche simplement la table que tu veux (genre `users`) et oublie pas de sauvegarder !

et voilà, maintenant dès qu'un truc bouge, supabase est au courant et prêt à le crier sur les toits.

---

## 2. donner la permission de lire (RLS)

le temps réel c'est bien, mais supabase fait attention à qui regarde quoi. si tu n'as pas donné le droit de "voir", les messages arriveront jamais à ton app.

1. va dans la partie **authentication** à gauche.
2. clique sur **policies**.
3. trouve ta table (ex: `users`).

**si tu veux juste tester (méthode rapide) :**
tu peux cliquer sur les `...` à côté du nom de la table et faire **disable rls**. attention, ça veut dire que tout le monde peut tout voir, donc c'est juste pour ton test !

**si tu veux faire ça proprement :**
clique sur **new policy** -> **get started quickly** -> choisis "enable read access for all users". vérifie que c'est bien pour le `SELECT` et enregistre.

---
