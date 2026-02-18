# Règles Projet — Alumni

## Contexte
Tu travailles sur **Alumni**, une plateforme permettant aux anciens étudiants de se retrouver, de mettre à jour leurs informations, de consulter des annonces (CDI, CDD, Freelance) et de suivre les événements de l'école.
Lis `docs/ARCHITECTURE.md` pour comprendre la structure complète.

## Règles techniques
- Utilise TypeScript strict, JAMAIS de `any`
- Utilise les Server Components Next.js par défaut (Next.js 15+ recommandé)
- Prisma pour toutes les requêtes DB (PostgreSQL)
- Gère les erreurs avec des try/catch et des messages explicites
- Chaque fonction publique doit avoir un JSDoc
- Authentification via NextAuth.js v5

## Conventions de code
- Maximum 300 lignes par fichier
- Extraire la logique complexe dans des hooks custom
- Nommer les fichiers en kebab-case
- Utiliser des barrel exports (index.ts)
- Styling avec Tailwind CSS et shadcn/ui

## Tests
- Vitest pour les tests unitaires
- Playwright pour les E2E
- Coverage minimum : 80%

## Ce qu'il ne faut JAMAIS faire
- Ne jamais committer de secrets ou clés API
- Ne pas utiliser console.log en production
- Ne pas ignorer les erreurs TypeScript avec @ts-ignore
- Ne pas créer de fichiers de plus de 300 lignes

## Commits
- Format : `type(scope): description concise`
- Types : feat, fix, refactor, test, docs, chore
- Scope : le module concerné (auth, dashboard, api, jobs, events)
- Commits atomiques : 1 feature/fix = 1 commit

## Workflows
- **EPCT** : Explore, Plan, Code, Test pour les tâches courantes.
- **PRP** : Product Requirement Prompt pour les grosses features ou le setup initial.
