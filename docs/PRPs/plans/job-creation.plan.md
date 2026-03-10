# Plan d'implémentation : Job Creation Management

## 🏗️ Architecture
- [ ] Créer un schéma de validation avec **Zod** pour les offres d'emploi.
- [ ] Améliorer la Server Action `createJob` pour inclure la validation et le typage strict.
- [ ] Créer un composant client `JobCreationForm` pour gérer le formulaire avec `react-hook-form`.

## ✍️ Implémentation
- [ ] Étape 1 : Définition des types et du schéma Zod.
- [ ] Étape 2 : Refactorisation de la Server Action pour retourner des messages d'état (success/error).
- [ ] Étape 3 : Création du formulaire interactif dans `/admin/jobs`.
- [ ] Étape 4 : Ajout du feedback utilisateur (Toasts ou Alerts).

## 🧪 Validation
- [ ] Soumission du formulaire vide -> Doit afficher des erreurs de validation.
- [ ] Soumission avec URL invalide -> Doit être bloqué.
- [ ] Soumission valide -> Doit rediriger et afficher la nouvelle offre.
