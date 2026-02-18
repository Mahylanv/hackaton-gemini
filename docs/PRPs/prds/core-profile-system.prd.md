# PRD : Core Profile System (Auth & Profiles)

## 🎯 Objectif
Mettre en place le système d'authentification natif Supabase et la gestion des profils Alumni pour permettre aux utilisateurs de se connecter et de renseigner leurs informations obligatoires.

## 👥 Utilisateurs
- **Alumni** : Doit pouvoir se connecter, mettre à jour son profil et voir les autres membres.
- **Intervenant / Admin** : Doit pouvoir gérer les comptes et pré-remplir des données.

## ✅ Scope (Inclus)
- [ ] Authentification via email/mot de passe (Supabase Auth).
- [ ] Création automatique d'un profil à l'inscription.
- [ ] Formulaire de profil complet : Nom, Prénom, Email (pré-rempli), LinkedIn, Année de diplôme, Diplôme obtenu.
- [ ] Middleware de protection des routes (redirection vers /login si non connecté).
- [ ] RLS (Row Level Security) : Un utilisateur ne peut modifier que son propre profil.

## ❌ Hors Scope (Exclu)
- [ ] Connexion via OAuth (Google/GitHub) - Prévu pour plus tard.
- [ ] Import CSV massif - Prévu dans une sous-phase dédiée.

## 🛠️ Contraintes Techniques
- [ ] Utilisation de `createBrowserClient` et `createServerClient` (@supabase/ssr).
- [ ] Formulaires avec `react-hook-form` + `zod`.
- [ ] Styling avec `shadcn/ui` (Input, Button, Card).

## 📊 Critères de Succès
- [ ] Un utilisateur peut créer un compte et se connecter.
- [ ] Les données de profil sont persistées dans la table `profiles` de Supabase.
- [ ] Un utilisateur non connecté est redirigé vers `/login`.
