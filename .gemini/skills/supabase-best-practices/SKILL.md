---
name: supabase-best-practices
description: Bonnes pratiques pour l'utilisation de Supabase avec Prisma.
---

# Supabase & Prisma Best Practices

## Connection Pooling
- Utilisez `DATABASE_URL` avec le port 6543 (Transaction mode) pour les Serverless Functions (Vercel).
- Utilisez `DIRECT_URL` avec le port 5432 (Session mode) pour les migrations Prisma.

## Sécurité (RLS)
- Supabase active Row Level Security par défaut sur les nouvelles tables.
- Prisma by-passes RLS car il utilise un utilisateur admin (postgres).
- Pour utiliser RLS avec Prisma, il faut configurer des policies complexes ou utiliser le client Supabase pour les requêtes sensibles.

## Modèles
- Assurez-vous que les types Prisma correspondent aux types PostgreSQL de Supabase.
- Utilisez des index sur les colonnes de recherche fréquente.
