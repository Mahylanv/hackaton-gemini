# Règles Projet — Alumni

## Contexte
Plateforme de gestion pour l'école.
- **Alumni** : Consultation publique (Annuaire + Jobs).
- **Admins** : Gestion des offres d'emploi.
- **Super Admin** : Gestion des rôles Admins.

## Règles techniques
- Utilise TypeScript strict, JAMAIS de `any`
- Supabase pour la DB et l'Auth (Admins uniquement)
- RLS : Lecture publique pour `profiles` et `jobs`. Écriture réservée aux rôles `ADMIN` et `SUPER_ADMIN`.
- Gère les erreurs avec des try/catch et des messages explicites

## Conventions de code
- Maximum 300 lignes par fichier
- Extraire la logique complexe dans des hooks custom
- Nommer les fichiers en kebab-case
- Styling avec Tailwind CSS et shadcn/ui

## Tests
- Vitest pour les tests unitaires
- Playwright pour les E2E

## Commits
- Format : `type(scope): description concise`
- Types : feat, fix, refactor, test, docs, chore
- Scope : auth, jobs, alumni, admin

## Workflows
- **EPCT** : Explore, Plan, Code, Test.
- **PRP** : Product Requirement Prompt.
