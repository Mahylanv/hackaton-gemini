# Commande /migrate

Cette commande exécute tous les fichiers SQL présents dans `supabase/migrations/` vers votre base de données Supabase.

## Prérequis
Assurez-vous d'avoir configuré `DATABASE_URL` dans votre fichier `.env.local`.
Le format doit être : `postgres://postgres:[MOT_DE_PASSE]@db.[ID_PROJET].supabase.co:5432/postgres`

## Exécution
Exécute la commande suivante :
`node scripts/migrate.mjs`
