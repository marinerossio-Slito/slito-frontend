# Slito — Architecture Front-end

Ce document est le pendant, côté client web, de `slito-backend/ARCHITECTURE.md`
(qui décrit l'API REST déjà construite et entièrement testée). Il sert de
référence et de feuille de route pour construire l'interface qui consomme
cette API.

## 1. Vue d'ensemble

Slito est une plateforme de réservation d'artisans. Le back-end (Symfony,
voir `slito-backend/`) expose une API REST stateless authentifiée par JWT.
Ce projet est **le site web** mentionné dans l'architecture back-end :

> le site web (React/VueJS), la future application mobile (App Store / Play Store)

Le site doit permettre à trois profils d'utiliser la plateforme :

- **Visiteur / client** : découvrir des artisans, consulter une fiche, prendre
  rendez-vous, échanger des messages, laisser un avis.
- **Artisan** : gérer sa fiche, son agenda, ses rendez-vous, ses clients et son
  abonnement.
- **Administrateur** : superviser la plateforme, gérer catégories et comptes.

## 2. Stack technique

| Couche | Technologie | Pourquoi |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Routage par fichiers, rendu serveur pour les pages publiques (SEO des fiches artisan), un seul outil pour tout le site |
| UI | React 19 + TypeScript | Typage qui colle aux DTOs de l'API, large écosystème |
| Style | Tailwind CSS v4 | Mise en page rapide, cohérente, sans fichiers CSS séparés à maintenir |
| Authentification | JWT (émis par `POST /api/login`), envoyé dans l'en-tête `Authorization: Bearer` à chaque requête | Aligné avec le choix stateless du back-end (cf. section "Authentification" d'`ARCHITECTURE.md` back-end) |

Le jeton est conservé côté client (mémoire + `localStorage` pour persister la
session au rechargement de page) et porté par un client API centralisé
(`src/lib/api.ts`) — jamais codé en dur dans les composants.

## 3. Organisation du code

```
src/
  app/                  Routes (App Router : un dossier = une URL)
    (public)/           Pages accessibles sans connexion
    (client)/           Espace client (connecté, rôle ROLE_USER + profil Customer)
    (artisan)/          Espace artisan (rôle ROLE_ARTISAN, compte approuvé)
    (admin)/            Espace admin (rôle ROLE_ADMIN)
  components/           Composants UI réutilisables (boutons, cartes, formulaires...)
  lib/
    api.ts              Client HTTP centralisé (base URL, en-têtes, gestion des erreurs)
    auth.ts             Stockage/lecture du jeton, décodage du rôle courant
  types/                Types TypeScript reflétant les réponses de l'API
  hooks/                Hooks personnalisés (ex. useAuth, useApi)
```

## 4. Pages prévues (calquées sur les endpoints du back-end)

| Route prévue | Endpoint(s) consommé(s) | Accès |
|---|---|---|
| `/` | `GET /api/categories`, `GET /api/search` | Public |
| `/recherche` | `GET /api/search` (filtres métier/ville/prix/note) | Public |
| `/entreprises/[id]` | `GET /api/businesses/{id}` | Public |
| `/connexion`, `/inscription` | `POST /api/login`, `POST /api/register/{customer,artisan}` | Public |
| `/mot-de-passe-oublie` | `POST /api/password/reset` | Public |
| `/compte/rendez-vous` | `GET/POST/PATCH /api/appointments` | Client |
| `/compte/avis` | `POST /api/reviews` | Client/Artisan |
| `/compte/messages` | `GET /api/conversations`, `POST /api/messages` | Client/Artisan |
| `/artisan/tableau-de-bord` | `GET /api/artisan/dashboard` | Artisan approuvé |
| `/artisan/agenda` | `GET /api/artisan/calendar` | Artisan approuvé |
| `/artisan/fiche` | `PUT /api/artisan/business` | Artisan approuvé |
| `/artisan/clients` | `GET /api/artisan/clients` | Artisan approuvé |
| `/artisan/abonnement` | `GET/POST /api/artisan/subscription...` | Artisan |
| `/admin/*` | `GET /api/admin/stats`, `/api/admin/categories`, `/api/admin/users/{id}` | Admin |

## 5. Feuille de route (par étapes)

Construire dans cet ordre — chaque étape s'appuie sur la précédente, et se
termine par un commit (« Étape N : ... »), comme pour le back-end :

1. **Squelette** : projet Next.js + Tailwind, arborescence, client API typé,
   variables d'environnement, page d'accueil connectée à l'API (catégories).
2. **Catalogue public** : recherche filtrée + fiche détaillée d'une entreprise.
3. **Authentification** : inscription (client/artisan), connexion, persistance
   du jeton, garde de routes par rôle, déconnexion.
4. **Espace client — réservation** : prise de RDV, suivi/annulation, avis.
5. **Messagerie** : conversations et envoi de messages (client ↔ entreprise).
6. **Espace artisan** : tableau de bord, agenda, fiche, base clients, abonnement.
7. **Espace admin** : statistiques, gestion des catégories et des comptes.
8. **Finitions** : états de chargement/erreur, responsive, accessibilité.
9. **Tests** (composants + bout-en-bout) sur les parcours critiques.

## 6. Notes de conception

- **Pas de session serveur** : comme le back-end est stateless, le front porte
  l'intégralité de l'état d'authentification (jeton + rôle déduits du payload
  JWT). Pas de cookies de session à gérer.
- **Un seul client API** (`src/lib/api.ts`) : centralise l'URL de base
  (`NEXT_PUBLIC_API_URL`), les en-têtes (`Authorization`, `Content-Type`), le
  décodage JSON et la normalisation des erreurs (`{ error: string }` ou
  `{ violations: [...] }` selon les contrôleurs du back-end).
- **Types alignés sur les DTOs réels** : les types TypeScript de `src/types/`
  sont écrits à partir de ce que les contrôleurs du back-end sérialisent
  réellement (cf. `serializeCategory`, `serializeBusinessSummary`...), pas
  d'après une supposition — pour rester en phase si l'API évolue.
