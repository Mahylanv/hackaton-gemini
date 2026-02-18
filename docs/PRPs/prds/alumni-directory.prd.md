# PRD : Alumni Directory (Annuaire)

## 🎯 Objectif
Permettre aux membres de la plateforme de consulter la liste des anciens étudiants, de rechercher des camarades par nom, diplôme ou année, et de consulter leurs profils LinkedIn.

## 👥 Utilisateurs
- **Alumni** : Veut retrouver des anciens de sa promo ou chercher des profils spécifiques pour du networking.
- **Admin** : Veut avoir une vue d'ensemble des membres inscrits.

## ✅ Scope (Inclus)
- [ ] Page `/alumni` affichant la liste des profils validés.
- [ ] Recherche textuelle (Nom/Prénom).
- [ ] Filtres par année de diplôme et par type de diplôme.
- [ ] Affichage des informations clés : Nom, Prénom, Diplôme, Année, et lien LinkedIn.
- [ ] Accès restreint aux utilisateurs connectés uniquement.

## ❌ Hors Scope (Exclu)
- [ ] Messagerie interne (prévu phase ultérieure).
- [ ] Statistiques avancées (graphiques).

## 🛠️ Contraintes Techniques
- [ ] Utilisation du client Supabase pour récupérer les données de la table `profiles`.
- [ ] Pagination ou filtrage côté serveur pour la performance.
- [ ] Respect de la RLS : Les profils ne sont visibles que par les utilisateurs authentifiés.

## 📊 Critères de Succès
- [ ] Un utilisateur connecté peut voir la liste des autres alumni.
- [ ] La recherche et les filtres fonctionnent correctement.
- [ ] Un utilisateur non connecté est redirigé vers `/login`.
