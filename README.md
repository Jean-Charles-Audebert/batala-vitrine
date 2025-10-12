# Batala LR - Site Vitrine PWA

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-24.10.0-green)](https://nodejs.org/)
[![Build Status](https://img.shields.io/github/workflow/status/<username>/<repo>/PR%20checks?label=CI)]()

---

## Projet

Site institutionnel **Single Page Application SSR** pour l’association Batala LR.  
Le site présente : activités, événements, offres de prestations, contacts.  

Les **administrateurs** peuvent se connecter pour gérer dynamiquement le contenu :
- CRUD blocs (texte, image, carrousel, événements…)
- Réorganisation des blocs (drag & drop)
- Upload d’images/documents
- Accessibilité (ARIA, tab navigation, focus visible)
- PWA : offline + installable

---

## Stack

- **Backend** : Node.js (ESM) + Express + Pug  
- **Database** : PostgreSQL (`pg`)  
- **Auth** : JWT + Refresh Token (HttpOnly) + Argon2id  
- **Upload** : Multer  
- **Tests** : Jest (TDD) + Playwright (E2E)  
- **CI/CD** : GitHub Actions + SonarCloud + Lighthouse  
- **Docker** : build image → push Docker Hub → NAS pull automatique  
- **PWA** : manifest.webmanifest + service worker minimal

---

## Installation

1. Cloner le dépôt :

```bash
git clone <repo-url>
cd <repo-name>
```

2. Installer les dépendances :

```bash
npm ci
```

3. Copier le fichier .env.example et remplir les secrets :

```bash
cp .env.example .env
```

4. Démarrer en mode dev : 

```bash
npm run dev
```

Le site sera disponible sur `http://localhost:3000`

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

* Push sur Docker Hub via Github Actions lors du merge sur `release`
* NAS : `docker-compose pull && docker-compose up -d` automatique

## Licence

Ce projet est sous Apache 2.0 License.
Vous pouvez réutiliser le code en respectant l'attribution et la notice de licence.
