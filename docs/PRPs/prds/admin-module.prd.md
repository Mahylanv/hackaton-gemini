# PRD : Admin Module

## 🎯 Objectif
Mettre en place un back-office sécurisé permettant au Super Admin de nommer des administrateurs (secrétariat) et aux administrateurs de gérer les offres d'emploi.

## 👥 Utilisateurs
- **Super Admin** : Gère les permissions (rôles) de tous les utilisateurs.
- **Admin (Secrétariat)** : Crée, modifie et supprime les offres d'emploi.

## ✅ Scope (Inclus)
- [ ] **Dashboard Admin** (`/admin`) : Vue d'ensemble des statistiques (nb alumni, nb jobs).
- [ ] **Gestion des Rôles** (`/admin/roles`) : Liste des utilisateurs et changement de rôle (User -> Admin). Réservé au Super Admin.
- [ ] **Gestion des Jobs** (`/admin/jobs`) : CRUD complet des offres d'emploi.
- [ ] **Sécurité** : Middleware et RLS pour empêcher l'accès non autorisé.

## ❌ Hors Scope (Exclu)
- [ ] Logs d'activité détaillés.
- [ ] Suppression définitive d'utilisateurs (uniquement changement de rôle).

## 🛠️ Contraintes Techniques
- [ ] Utilisation de `auth.uid()` et de la table `profiles.role` pour les vérifications.
- [ ] Server Actions pour les mutations de données.
- [ ] Composants `shadcn/ui` (Table, Dialog, Select).

## 📊 Critères de Succès
- [ ] Seul un utilisateur avec le rôle `SUPER_ADMIN` peut accéder à la page des rôles.
- [ ] Un `ADMIN` peut créer une offre d'emploi qui apparaît immédiatement sur la page publique.
- [ ] Un utilisateur sans rôle admin est redirigé vers l'accueil s'il tente d'accéder à `/admin`.
