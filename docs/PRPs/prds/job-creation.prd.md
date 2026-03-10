# PRD : Job Creation Management

## 🎯 Objectif
Permettre aux administrateurs de créer, publier et gérer des offres d'emploi avec une validation stricte des données pour garantir la qualité du contenu affiché aux Alumni.

## 👥 Utilisateurs
- **Admins & Super Admin** : Responsables de la publication des opportunités professionnelles.

## ✅ Scope (Inclus)
- [ ] Formulaire de création d'offre complet : Titre, Entreprise, Type (CDI, CDD, Freelance, Stage), Lieu, Lien externe, Description.
- [ ] Validation des données avec **Zod** (champs obligatoires, format URL).
- [ ] Gestion des états de chargement (loading states) lors de la soumission.
- [ ] Notifications de succès ou d'erreur (Toast ou message d'état).
- [ ] RLS : Vérification côté serveur que seul un admin peut insérer des données.

## ❌ Hors Scope (Exclu)
- [ ] Edition d'offre existante (prévue pour une itération future).
- [ ] Upload de logo d'entreprise (utilisation de texte pour l'instant).

## 🛠️ Contraintes Techniques
- [ ] Server Action avec validation Zod.
- [ ] Utilisation du composant `form` de shadcn/ui.
- [ ] Redirection vers la liste des jobs après succès.

## 📊 Critères de Succès
- [ ] Une offre ne peut pas être créée si des champs obligatoires sont manquants.
- [ ] L'URL de l'offre est validée au format standard.
- [ ] L'offre apparaît instantanément dans l'annuaire public `/jobs`.
