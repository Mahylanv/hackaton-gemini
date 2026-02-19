# Plan d'implémentation : Events Module

## 🏗️ Architecture (SQL)
- [ ] Créer la table `events` (id, title, date, start_time, end_time, description, type, location, created_at, author_id).
- [ ] Configurer les RLS policies (SELECT public, INSERT/UPDATE/DELETE Admin).

## 🏗️ Architecture (App)
- [ ] **Types** : Créer `src/types/events.ts` avec le schéma Zod.
- [ ] **Actions** : Ajouter `createEvent` et `deleteEvent` dans `src/app/admin/actions.ts`.
- [ ] **Pages** :
  - `/admin/events` : Gestion des événements par les admins.
  - `/events` : Liste publique des événements.
- [ ] **Composants** : `EventCreationForm`.

## ✍️ Implémentation
- [ ] Étape 1 : Script SQL et migration.
- [ ] Étape 2 : Schéma Zod et Server Actions.
- [ ] Étape 3 : Formulaire de création d'événement.
- [ ] Étape 4 : Page publique et design des cartes.

## 🧪 Validation
- [ ] Création d'un événement -> Vérifier l'insertion en base.
- [ ] Test de validation Zod sur les heures.
- [ ] Vérification de l'affichage public.
