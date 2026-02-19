# PRD : Events Module

## 🎯 Objectif
Permettre aux administrateurs de créer et gérer des événements (conférences, meetups, soirées BDE) pour animer le réseau Alumni.

## 👥 Utilisateurs
- **Admins & Super Admin** : Création et gestion des événements.
- **Alumni (Public)** : Consultation de l'agenda des événements.

## ✅ Scope (Inclus)
- [ ] Table `events` dans Supabase avec titre, date, heures, description, type et lieu.
- [ ] Formulaire de création d'événement (Admin uniquement) avec validation Zod.
- [ ] Page publique `/events` listant les événements à venir.
- [ ] Gestion des accès (RLS) : Lecture publique, écriture Admin.

## ❌ Hors Scope (Exclu)
- [ ] Système d'inscription/RSVP (prévu pour plus tard).
- [ ] Export vers Google Calendar.

## 🛠️ Contraintes Techniques
- [ ] Dates gérées au format ISO.
- [ ] Validation stricte des heures (début < fin).
- [ ] Utilisation de `shadcn/ui`.

## 📊 Critères de Succès
- [ ] Un admin peut publier un événement avec succès.
- [ ] L'événement s'affiche immédiatement sur la page publique.
- [ ] Les heures de début et de fin sont cohérentes.
