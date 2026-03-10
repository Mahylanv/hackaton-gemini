# Plan d'implémentation : Admin Module

## 🏗️ Architecture (SQL)
- [ ] Créer la table `jobs` (id, title, company, description, type, location, link, created_at).
- [ ] Mettre à jour les RLS pour `jobs` :
  - `SELECT` : Public.
  - `INSERT/UPDATE/DELETE` : Réservé aux utilisateurs dont le profil a le rôle `ADMIN` ou `SUPER_ADMIN`.
- [ ] Ajouter une policy pour les rôles : Seul un `SUPER_ADMIN` peut `UPDATE` la colonne `role` dans `profiles`.

## 🏗️ Architecture (App)
- [ ] **Pages** :
  - `/admin` : Statistiques de base.
  - `/admin/roles` : Liste des utilisateurs + Formulaire de changement de rôle.
  - `/admin/jobs` : Liste des jobs avec bouton "Ajouter" et "Supprimer".
- [ ] **Actions** :
  - `updateRole` : Change le rôle d'un utilisateur.
  - `createJob` : Ajoute une offre d'emploi.
  - `deleteJob` : Supprime une offre.

## ✍️ Implémentation
- [ ] Étape 1 : Création de la table `jobs` et des politiques RLS.
- [ ] Étape 2 : Création d'un utilitaire `checkAdmin` pour protéger les Server Actions.
- [ ] Étape 3 : Implémentation de la gestion des jobs.
- [ ] Étape 4 : Implémentation de la gestion des rôles.

## 🧪 Validation
- [ ] Créer un job en tant qu'admin -> Vérifier l'apparition sur la page publique `/jobs`.
- [ ] Tenter de changer un rôle avec un compte standard -> Doit être bloqué.
