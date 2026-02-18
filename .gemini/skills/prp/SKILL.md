---
name: prp
description: Framework Product Requirement Prompt pour livrer des fonctionnalités complètes et testées. Utiliser pour la planification et l'implémentation de grosses features.
---

# Skill : PRP (Product Requirement Prompt)

Cette skill permet d'orchestrer la création de fonctionnalités de bout en bout en utilisant des documents structurés.

## Workflows

### 1. Création d'un PRD
- Lit `docs/templates/prd-template.md`.
- Analyse les besoins utilisateur.
- Crée un nouveau PRD dans `docs/PRPs/prds/[feature].prd.md`.

### 2. Création d'un Plan
- Analyse le PRD correspondant.
- Lit `docs/templates/plan-template.md`.
- Identifie les impacts sur le codebase actuel.
- Crée un plan dans `docs/PRPs/plans/[feature].plan.md`.

### 3. Implémentation
- Suit le plan d'implémentation étape par étape.
- Valide chaque étape avec des tests.
- Archive le plan dans `docs/PRPs/plans/completed/` une fois terminé.
- Rédige un rapport dans `docs/PRPs/reports/[feature].report.md`.

## Règles d'or
- Toujours vérifier les conventions dans `GEMINI.md`.
- Utiliser Context7 pour les documentations de librairies.
- PAUSE et demander confirmation si une étape du plan échoue ou nécessite un arbitrage.
