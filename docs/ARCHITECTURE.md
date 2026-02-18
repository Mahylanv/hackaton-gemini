# Architecture — Alumni

## Vue d'ensemble
Application de gestion d'Alumni utilisant Next.js avec une architecture basée sur l'App Router et Supabase pour tout le backend.

## Stack technique
- **Frontend** : Next.js 15 / App Router
- **Backend** : Supabase (Database, Auth, Storage)
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (SSR)
- **Styling** : Tailwind CSS + shadcn/ui
- **Validation** : Zod
- **Tests** : Vitest + Playwright

## Structure du projet
src/
├── app/           # Routes et pages (App Router)
├── components/    # Composants React réutilisables
│   ├── ui/       # Composants de base (shadcn)
│   └── features/ # Composants métier
├── lib/          # Utilitaires Supabase client
├── utils/        # Utilitaires Supabase server
├── hooks/        # Hooks React personnalisés
└── types/        # Types TypeScript partagés

## Design Patterns
- Server Components par défaut
- Server Actions avec Supabase Server Client
- Row Level Security (RLS) pour la protection des données
- Formulaires gérés avec React Hook Form + Zod

## Conventions
- Nommage : camelCase pour variables/fonctions, PascalCase pour composants
- Un composant par fichier
- Colocation des tests si possible
