# Plan d'implémentation : Alumni Directory

## 🏗️ Architecture
- [ ] Création de la page `/alumni/page.tsx` (Server Component).
- [ ] Utilisation de `searchParams` pour gérer la recherche et les filtres.
- [ ] Récupération des données via Supabase Server Client.
- [ ] Création de composants UI :
    - `AlumniCard` : Pour afficher un profil individuel.
    - `AlumniFilters` : Formulaire de recherche et de sélection d'année/diplôme.

## ✍️ Implémentation
- [ ] Étape 1 : Créer la structure de base de la page `/alumni`.
- [ ] Étape 2 : Implémenter la logique de filtrage côté serveur avec Supabase `.ilike()` et `.eq()`.
- [ ] Étape 3 : Ajouter les composants de filtrage (Input de recherche, Select pour l'année).
- [ ] Étape 4 : Designer les cartes de profil avec LinkedIn.

## 🧪 Validation
- [ ] La page charge tous les profils par défaut.
- [ ] La recherche par nom filtre correctement les résultats.
- [ ] Cliquer sur le lien LinkedIn ouvre une nouvelle fenêtre.
- [ ] Un utilisateur non authentifié ne peut pas accéder à la page.
