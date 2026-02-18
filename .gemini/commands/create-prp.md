# Create PRP (Product Requirement Prompt)

Tu es chargé de créer un PRP complet pour une nouvelle fonctionnalité.

## Qu'est-ce qu'un PRP ?
Un PRP est un document structuré qui fournit tout le nécessaire pour livrer du code prêt pour la production dès le premier passage. Il combine :
- Les exigences produit (quoi et pourquoi).
- L'intelligence du codebase (patterns existants, références).
- Le guide d'implémentation (comment).
- Les critères de validation (comment vérifier).

## Processus de recherche
Avant de créer le PRP, effectue des recherches approfondies :
1. **Revue de la doc** : `GEMINI.md`, `docs/ARCHITECTURE.md`.
2. **Exploration** : Trouve des fonctionnalités similaires, comprends les patterns.
3. **Web Search** : Documentation de librairies via Context7 si nécessaire.

## Structure du PRP
Crée un fichier dans `docs/PRPs/` (par exemple `feature-name.prp.md`) avec cette structure :

### Goal
Une phrase claire sur ce qu'on construit.

### Technical Context
- Fichiers de référence (read-only).
- Fichiers à créer/modifier.
- Patterns existants à suivre.

### Implementation Details
- Spécifications API / Endpoints.
- Schéma de base de données / Migrations.
- Composants UI.

### Validation Criteria
- Liste de critères testables.
- Étapes de vérification pas à pas.

---
**Fonctionnalité à implémenter :** {{args}}
