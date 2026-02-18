# Plan d'implémentation : Core Profile System

## 🏗️ Architecture (SQL)
- [ ] Créer la table `profiles` dans Supabase (id, email, first_name, last_name, linkedin_url, grad_year, degree, role).
- [ ] Configurer un Trigger PostgreSQL pour créer automatiquement une entrée dans `profiles` lors d'une nouvelle inscription dans `auth.users`.
- [ ] Définir les RLS policies : 
  - `SELECT` : Tout utilisateur authentifié peut voir les profils.
  - `UPDATE` : Un utilisateur ne peut modifier que son propre profil (auth.uid() = user_id).

## 🏗️ Architecture (App)
- [ ] **Pages** :
  - `/login` : Connexion / Inscription.
  - `/profile` : Formulaire de mise à jour des informations.
- [ ] **Actions** :
  - `signUp` : Création de compte.
  - `signIn` : Connexion.
  - `signOut` : Déconnexion.
  - `updateProfile` : Mise à jour des données Alumni.

## 🧪 Validation
- [ ] Inscription d'un nouvel utilisateur -> Vérification dans le dashboard Supabase.
- [ ] Tentative de modification du profil d'un autre utilisateur -> Doit échouer (RLS).
- [ ] Accès à `/profile` sans être connecté -> Redirection vers `/login`.
