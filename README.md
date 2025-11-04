# Batala LR – Site vitrine SSR

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-24.10.0-green)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/workflow/status/<username>/<repo>/PR%20checks?label=CI)]()

---

## Projet

Site institutionnel rendu côté serveur (**SSR**) pour l’association Batala LR (Express + EJS).  
Le site présente activités, événements, offres de prestations et contacts.

Les administrateurs peuvent se connecter pour gérer dynamiquement le contenu (blocs et cartes),
avec authentification JWT + cookies httpOnly (refresh).

---

## Stack

- Backend : Node.js (ESM) + Express + EJS  
- Base de données : PostgreSQL (`pg`)  
- Authentification : JWT (access) + Refresh Token en cookie HttpOnly, Argon2id pour les mots de passe  
- Sécurité : Helmet (CSP configurée pour Font Awesome CDN, images https/data)  
- Tests : Jest (unitaires) + Playwright (E2E)  
- CI : GitHub Actions (lint + tests)  
- Docker : image Node + docker-compose pour Postgres

---

## Installation et démarrage

1. Cloner le dépôt :

```bash
git clone <repo-url>
cd <repo-name>
```

2. Installer les dépendances :

```bash
npm ci
```

3. Créer un fichier `.env` à la racine avec les variables nécessaires :

```env
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5433
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT
JWT_SECRET=changeme-dev
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=changeme-refresh
JWT_REFRESH_EXPIRES_IN=7d
```

4. Démarrer une base Postgres locale via Docker Compose (port hôte 5433 → conteneur 5432) :

```bash
npm run db:start
```

5. Initialisation automatique: les scripts SQL sous `db/001_schema.sql` et `db/002_seed.sql` sont exécutés au premier démarrage du conteneur Postgres. Pour réinitialiser complètement:

```bash
npm run db:reset
```

6. Créer l’admin de test (recommandé pour l’E2E) :

```bash
npm run seed:test-admin
```

7. Démarrer en mode dev : 

```bash
npm run dev
```

Le site sera disponible sur `http://localhost:3000`

Endpoint de diagnostic (dev): `GET /health` renvoie l’état DB (base, user, host:port, search_path, présence de `cards`, compte des enregistrements).

Astuce: si vous modifiez la CSP ou les assets, vérifiez que Font Awesome est
bien autorisé (cdnjs.cloudflare.com) et que les images https/data sont permises.

---

## Routes principales

- Public
	- `GET /` page d’accueil (SSR)
	- `GET /health` état runtime et DB (dev)
	- `GET /auth/login` page de connexion
	- `POST /auth/login/web` soumission du formulaire de connexion (redirection vers `/admins`)
	- `GET /auth/logout/web` déconnexion (clear cookies + redirection)

- Administratif (protégé JWT)
	- `GET /admins` gestion des administrateurs
	- `GET /blocks` gestion des blocs

- API (protégé JWT)
	- `GET /api/blocks/:blockId/elements` liste des éléments d’un bloc
	- `POST /api/blocks/:blockId/elements` création d’un élément
	- `PUT /api/elements/:id` mise à jour d’un élément
	- `DELETE /api/elements/:id` suppression d’un élément
	- `POST /auth/refresh` rafraîchir l’access token depuis le cookie `refresh_token`

Cookies utilisés:
- `access_token` (httpOnly) – optionnel côté web (accès aussi via Authorization: Bearer)
- `refresh_token` (httpOnly) – pour renouveler l’access token

## Tests

* Unitaires (Jest)
  
```bash
npm test
```

* E2E (Playwright)
  
```bash
npm run e2e
```

* Lint

```bash
npm run lint
```

* Lighthouse CI (local)

```bash
npm run lhci:collect
npm run lhci:assert
```

## Déploiement

* Build Docker :

```bash
npm run build:docker
```

* Push sur Docker Hub via GitHub Actions (exemple dans `.github/workflows/`)
* Serveur/NAS : `docker compose pull && docker compose up -d`

## Licence

Ce projet est sous licence Apache 2.0 (voir `LICENSE`).

**Copyright © 2025 caixaDev** – [https://caixadev.dev](https://caixadev.dev)

---

- Upload d’images/documents (Multer) avec stockage public et sanitation
- Drag & drop pour l’ordre des blocs et des éléments
- PWA (manifest + service worker) pour mode offline/installable
- Tableau de bord administrateur enrichi

---

## Licence (suite)

Note: le champ `license` dans `package.json` est aligné sur `Apache-2.0`.

