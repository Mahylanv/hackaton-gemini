# Workflow EPCT (Explore, Plan, Code, Test)

Avant de commencer toute modification, suis ce workflow étape par étape.

## Phase 1 : Explore
Explore le codebase à l'aide de `grep_search`, `glob` et `read_file` pour comprendre le contexte, la structure et les conventions existantes liées à la tâche. Identifie les fichiers impactés.

## Phase 2 : Plan
Rédige un plan d'implémentation détaillé :
- Liste les fichiers à créer ou modifier.
- Décris les changements techniques.
- Liste les tests à écrire ou mettre à jour.
- Si doutes : recherche web pour vérifier des documentations ou patterns.
- Si questions critiques : demande confirmation à l'utilisateur.

## Phase 3 : Code
Implémente les changements en respectant strictement les conventions définies dans `GEMINI.md` et `docs/ARCHITECTURE.md`.
Assure-toi que le code est typé (TypeScript strict) et suit le style existant.

## Phase 4 : Test
Valide tes modifications :
- Exécute les tests unitaires et d'intégration existants.
- Crée de nouveaux tests pour couvrir les nouveaux comportements.
- Si des erreurs surviennent, retourne à la phase **Plan** pour réévaluer ta stratégie.

## Phase 5 : Write Up
Rédige un résumé des changements effectués, incluant les choix techniques marquants et les commandes utiles pour la suite.
