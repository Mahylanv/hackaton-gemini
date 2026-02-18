# Architecture — Alumni

## Vue d'ensemble
Application de gestion d'Alumni utilisant Next.js avec une architecture basée sur l'App Router.

## Stack technique
- **Frontend** : Next.js 15 / App Router
- **Backend** : API Routes Next.js / Server Actions
- **Base de données** : Supabase (PostgreSQL) + Prisma ORM
- **Auth** : NextAuth.js v5 (Auth.js)
- **Styling** : Tailwind CSS + shadcn/ui
- **Validation** : Zod
- **Tests** : Vitest + Playwright

## Structure du projet
src/
├── app/           # Routes et pages (App Router)
├── components/    # Composants React réutilisables
│   ├── ui/       # Composants de base (shadcn)
│   └── features/ # Composants métier (auth, jobs, alumni)
├── lib/          # Utilitaires, config (prisma, auth), helpers
├── hooks/        # Hooks React personnalisés
├── server/       # Logique serveur (actions, services)
└── types/        # Types TypeScript partagés

## Design Patterns
- Server Components par défaut
- Server Actions pour les mutations
- Repository/Service pattern pour l'accès aux données
- Formulaires gérés avec React Hook Form + Zod

## Conventions
- Nommage : camelCase pour variables/fonctions, PascalCase pour composants
- Un composant par fichier
- Colocation des tests si possible
