# Architecture — Alumni

## Vue d'ensemble
Application de gestion d'Alumni avec un accès public pour la consultation et un accès restreint pour l'administration.

## Stack technique
- **Frontend** : Next.js 15 / App Router
- **Backend** : Supabase (Database, Auth, Storage)
- **Auth** : Supabase Auth (SSR) - Uniquement pour les Admins et Super Admin.
- **Accès** : 
    - Public : `/`, `/alumni`, `/jobs` (Lecture seule).
    - Privé : `/admin/*` (Gestion des offres et rôles).

## Row Level Security (RLS)
- `jobs` : `SELECT` pour tous (anon), `ALL` pour les rôles `ADMIN`.
- `profiles` (Alumni) : `SELECT` pour tous.
