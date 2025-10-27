# Projet : Site Institutionnel Batala LR (PWA + Node.js SSR)

## 🎯 Objectif
Créer un site institutionnel (PWA) pour l’association Batala LR.  
Le site présente les activités, événements, offres de prestation et contacts.  
Les administrateurs peuvent se connecter pour gérer dynamiquement le contenu (blocs, images, textes, ordre, etc.).

Technos : Node.js (ESM) + Express + Pug + PostgreSQL  
Tests : Jest (TDD) + Playwright (E2E)  
Déploiement : Docker + NAS (pull automatique)  
Analyse : SonarCloud + Lighthouse  
Gestion : GitHub Copilot Pro + GitHub Projects (Epics, branches, PR, revues IA)

---

## 🧩 Épics


# Projet : Site Institutionnel Batala LR (PWA + Node.js SSR)

## 🎯 Objectif
Créer un site institutionnel PWA pour l’association Batala LR.  
Le site présente les activités, événements, offres de prestation et contacts.  
Les administrateurs peuvent se connecter pour gérer dynamiquement le contenu (blocs, images, textes, ordre, etc.).

Technos : Node.js (ESM) + Express + Pug + PostgreSQL  
Tests : Jest (TDD) + Playwright (E2E)  
Déploiement : Docker + NAS  
Analyse : SonarCloud + Lighthouse  
Gestion : GitHub Copilot Pro + GitHub Projects (Epics, branches, PR, revues IA)

---

## 🧩 Épics et User Stories

### Epic 1 : Infrastructure & Configuration
**Backlog**
- US1.1 : Initialiser le projet Node.js + Express + Pug + PostgreSQL
- US1.2 : Ajouter ESM, Jest, Playwright
- US1.3 : Configurer ESLint et Prettier
- US1.4 : Ajouter gestion .env (dotenv)
- US1.5 : Mettre en place Dockerfile + docker-compose.yml
- US1.6 : Configurer GitHub Actions (lint, test, audit, build, push Docker)
- US1.7 : Configurer SonarCloud & Lighthouse
- US1.8 : Configurer GitHub Copilot Pro + GitHub Projects

### Epic 2 : Authentification et Sécurité
**Backlog**
- US2.1 : Authentification JWT + Refresh Token (HttpOnly)
- US2.2 : Mot de passe hashé avec Argon2id
- US2.3 : Gestion utilisateurs admin (création, invitation par email)
- US2.4 : Page de création de mot de passe via lien email
- US2.5 : Middleware de protection des routes /dashboard

### Epic 3 : Gestion de Contenu (CMS simplifié)
**Backlog**
- US3.1 : CRUD des blocs dynamiques (présentation, événements, offres, carrousel)
- US3.2 : Modification de l’ordre des blocs (drag & drop)
- US3.3 : Upload d’images/documents
- US3.4 : Validation et nettoyage des entrées (regex + sanitization)
- US3.5 : Accessibilité ARIA + navigation clavier

### Epic 4 : Interface Utilisateur (PWA)
**Backlog**
- US4.1 : Page publique SSR avec Hero, sections dynamiques, footer
- US4.2 : Bouton admin SVG pour connexion
- US4.3 : Dashboard admin avec gestion des blocs
- US4.4 : Animation fluide et transitions légères (CSS)
- US4.5 : Bouton scroll-to-top SVG
- US4.6 : Manifest + Service Worker (offline + installable)

### Epic 5 : Tests & Qualité
**Backlog**
- US5.1 : Tests unitaires TDD (Jest)
- US5.2 : Tests E2E pour flux critiques (Playwright)
