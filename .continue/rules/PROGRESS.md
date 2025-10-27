# 📊 Tableau de Bord d'Avancement - Batala LR

**Date de dernière mise à jour** : 24 octobre 2025  
**Progression globale** : 7.7% (2/26 user stories complétées)

---

## 🎯 Vue d'ensemble par Epic

### Epic 1 : Infrastructure & Configuration
**Progression** : 25% (2/8 complétées)  
**Statut** : 🚧 EN COURS

| US | Titre | Statut | Priorité |
|----|-------|--------|----------|
| US1.1 | Initialiser le projet Node.js + Express + Pug + PostgreSQL | ✅ DONE | P0 |
| US1.4 | Ajouter gestion .env (dotenv) | ✅ DONE | P0 |
| US1.2 | Ajouter ESM, Jest, Playwright | 📋 TODO | P0 |
| US1.3 | Configurer ESLint et Prettier | 📋 TODO | P1 |
| US1.5 | Mettre en place Dockerfile + docker-compose.yml | 🚧 IN_PROGRESS | P1 |
| US1.8 | Configurer GitHub Copilot | 🚧 IN_PROGRESS | P2 |
| US1.6 | Configurer GitHub Actions | 📋 TODO | P2 |
| US1.7 | Configurer SonarCloud & Lighthouse | 📋 TODO | P2 |

**Points bloquants** :
- ⚠️ Aucun test configuré (Jest/Playwright) — bloque la qualité du code
- ⚠️ Pas de Dockerfile — bloque le déploiement
- ⚠️ Pas de CI/CD — bloque l'automatisation

**Prochaines étapes prioritaires** :
1. **US1.2** : Configurer Jest + écrire premier test unitaire (homeController)
2. **US1.5** : Finaliser Dockerfile et tester `docker-compose up`
3. **US1.3** : Configurer ESLint pour maintenir la qualité

---

### Epic 2 : Authentification et Sécurité
**Progression** : 0% (0/5 complétées)  
**Statut** : 📋 TODO

| US | Titre | Statut | Priorité |
|----|-------|--------|----------|
| US2.1 | Authentification JWT + Refresh Token | 📋 TODO | P0 |
| US2.2 | Mot de passe hashé avec Argon2id | 📋 TODO | P0 |
| US2.5 | Middleware de protection des routes /dashboard | 📋 TODO | P0 |
| US2.3 | Gestion utilisateurs admin (création, invitation) | 📋 TODO | P1 |
| US2.4 | Page de création de mot de passe via lien email | 📋 TODO | P1 |

**Points bloquants** :
- ⚠️ Aucune authentification implémentée — bloque toutes les fonctionnalités admin
- ⚠️ Pas de middleware de protection — routes admin non sécurisées

**Prochaines étapes prioritaires** :
1. **US2.2** : Créer `src/utils/password.js` avec argon2
2. **US2.1** : Implémenter login JWT + refresh token
3. **US2.5** : Créer middleware `authMiddleware.js`

---

### Epic 3 : Gestion de Contenu (CMS simplifié)
**Progression** : 0% (0/5 complétées)  
**Statut** : 📋 TODO (bloqué par Epic 2)

| US | Titre | Statut | Priorité |
|----|-------|--------|----------|
| US3.1 | CRUD des blocs dynamiques | 📋 TODO | P0 |
| US3.4 | Validation et nettoyage des entrées | 📋 TODO | P0 |
| US3.3 | Upload d'images/documents | 📋 TODO | P1 |
| US3.2 | Modification de l'ordre des blocs (drag & drop) | 📋 TODO | P1 |
| US3.5 | Accessibilité ARIA + navigation clavier | 📋 TODO | P2 |

**Dépendances** :
- ⛔ **Bloqué par Epic 2** : toutes les routes CRUD nécessitent l'authentification

**Prochaines étapes** :
1. Attendre finalisation Epic 2 (auth)
2. **US3.1** : Créer blockController avec CRUD
3. **US3.4** : Ajouter validation express-validator

---

### Epic 4 : Interface Utilisateur (PWA)
**Progression** : 16.7% (1/6 en cours)  
**Statut** : 🚧 EN COURS

| US | Titre | Statut | Priorité |
|----|-------|--------|----------|
| US4.1 | Page publique SSR avec Hero, sections dynamiques, footer | 🚧 IN_PROGRESS | P0 |
| US4.3 | Dashboard admin avec gestion des blocs | 📋 TODO | P0 |
| US4.2 | Bouton admin SVG pour connexion | 📋 TODO | P1 |
| US4.4 | Animation fluide et transitions légères | 📋 TODO | P2 |
| US4.5 | Bouton scroll-to-top SVG | 📋 TODO | P2 |
| US4.6 | Manifest + Service Worker (offline + installable) | 📋 TODO | P2 |

**État actuel** :
- ✅ Route `/` existe avec vue `index.pug` basique
- ⚠️ Pas encore de chargement dynamique des blocs depuis DB
- ⚠️ Pas de CSS ni de design responsive

**Prochaines étapes prioritaires** :
1. **US4.1** : Charger blocs depuis DB dans homeController
2. **US4.1** : Créer `public/css/style.css` et design responsive
3. **US4.3** : Créer dashboard admin (après Epic 2)

---

### Epic 5 : Tests & Qualité
**Progression** : 0% (0/2 complétées)  
**Statut** : 📋 TODO (critique)

| US | Titre | Statut | Priorité |
|----|-------|--------|----------|
| US5.1 | Tests unitaires TDD (Jest) | 📋 TODO | P0 |
| US5.2 | Tests E2E pour flux critiques (Playwright) | 📋 TODO | P1 |

**Points bloquants** :
- ⚠️ **CRITIQUE** : Aucun test écrit — risque élevé de régression
- ⚠️ Pas de Jest configuré
- ⚠️ Pas de Playwright configuré

**Prochaines étapes prioritaires** :
1. **US5.1** : Configurer Jest pour ESM
2. **US5.1** : Écrire tests unitaires pour homeController, adminController
3. **US5.2** : Configurer Playwright et écrire test E2E page d'accueil

---

## 🚀 Roadmap Priorisée (30 jours)

### Sprint 1 (Jours 1-7) : Infrastructure & Tests
**Objectif** : Poser les fondations techniques

- [ ] **US1.2** : Configurer Jest + Playwright
- [ ] **US5.1** : Écrire premiers tests unitaires (homeController, adminController)
- [ ] **US1.5** : Finaliser Dockerfile et tester docker-compose
- [ ] **US1.3** : Configurer ESLint + Prettier
- [ ] **US1.4** : Créer `.env.example` documenté

**Livrables** : Tests fonctionnels, Docker opérationnel, linting OK

---

### Sprint 2 (Jours 8-14) : Authentification & Sécurité
**Objectif** : Sécuriser l'application

- [ ] **US2.2** : Implémenter hash Argon2id
- [ ] **US2.1** : Créer authController (login, refresh, logout)
- [ ] **US2.5** : Créer authMiddleware de protection
- [ ] **US5.1** : Tests unitaires auth
- [ ] **US5.2** : Test E2E login/logout

**Livrables** : Authentification JWT fonctionnelle + tests

---

### Sprint 3 (Jours 15-21) : CMS & CRUD Blocs
**Objectif** : Implémenter la gestion de contenu

- [ ] **US3.1** : CRUD blocs (routes + contrôleur + vues)
- [ ] **US3.4** : Validation et sanitization
- [ ] **US3.3** : Upload d'images (multer)
- [ ] **US4.3** : Dashboard admin
- [ ] **US5.1** : Tests unitaires blockController
- [ ] **US5.2** : Test E2E CRUD complet

**Livrables** : Dashboard admin fonctionnel avec CRUD

---

### Sprint 4 (Jours 22-30) : UI & PWA
**Objectif** : Finaliser l'interface utilisateur

- [ ] **US4.1** : Finaliser page publique dynamique + CSS responsive
- [ ] **US3.2** : Drag & drop pour réordonnancement
- [ ] **US4.6** : Manifest + Service Worker PWA
- [ ] **US4.2** : Bouton admin SVG
- [ ] **US3.5** : Accessibilité ARIA
- [ ] **US5.2** : Tests E2E complets

**Livrables** : Site public finalisé + PWA installable

---

## 🎯 Métriques de Qualité (Cibles)

| Métrique | Actuel | Cible | Statut |
|----------|--------|-------|--------|
| Test Coverage | 0% | 80% | 🔴 NON CONFORME |
| Tests unitaires | 0 | 50+ | 🔴 CRITIQUE |
| Tests E2E | 0 | 10+ | 🔴 CRITIQUE |
| Performance Lighthouse | N/A | 90+ | ⚪ NON TESTÉ |
| Accessibilité Lighthouse | N/A | 95+ | ⚪ NON TESTÉ |
| SonarCloud Quality Gate | N/A | PASS | ⚪ NON CONFIGURÉ |
| Erreurs ESLint | ? | 0 | ⚪ NON CONFIGURÉ |

---

## 📋 Tâches Immédiates (Cette Semaine)

### Priorité P0 (Bloquant)
1. **Configurer Jest** pour ESM (`jest.config.js`)
2. **Écrire 3 tests unitaires** : homeController, adminController, db.query
3. **Créer Dockerfile** et valider `docker-compose up`
4. **Créer `.env.example`** avec toutes les variables documentées

### Priorité P1 (Important)
5. **Configurer ESLint** flat config + corriger erreurs
6. **Implémenter hash Argon2id** (`src/utils/password.js`)
7. **Créer route login** (`/auth/login`) avec JWT

### Priorité P2 (Souhaitable)
8. **Configurer Playwright** (`playwright.config.js`)
9. **Écrire test E2E** : page d'accueil charge correctement
10. **Ajouter CSS de base** dans `public/css/style.css`

---

## 🔍 Analyse des Risques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Pas de tests = regressions fréquentes | 🔴 ÉLEVÉ | 🔴 ÉLEVÉ | Sprint 1 : configurer Jest + écrire tests |
| Pas d'auth = routes admin exposées | 🔴 ÉLEVÉ | 🔴 ÉLEVÉ | Sprint 2 : implémenter JWT + middleware |
| Pas de Docker = déploiement bloqué | 🟠 MOYEN | 🟠 MOYEN | Sprint 1 : finaliser Dockerfile |
| Pas de CI/CD = pas d'automatisation | 🟠 MOYEN | 🟡 FAIBLE | Sprint 1-2 : configurer GitHub Actions |
| Pas de validation = failles XSS/injection | 🔴 ÉLEVÉ | 🟠 MOYEN | Sprint 3 : express-validator + sanitization |

---

## 💡 Recommandations Stratégiques

### Court Terme (Semaines 1-2)
1. **Prioriser les tests** : configurer Jest/Playwright avant d'ajouter plus de code
2. **Finaliser Docker** : bloquant pour le déploiement NAS
3. **Sécuriser l'authentification** : critique pour protéger les routes admin

### Moyen Terme (Semaines 3-4)
4. **Implémenter le CMS** : cœur de la fonctionnalité
5. **Améliorer l'UI** : rendre le site présentable
6. **Configurer CI/CD** : automatiser qualité et déploiement

### Long Terme (Post-MVP)
7. **PWA avancé** : offline, notifications push
8. **Performance** : optimisation images, lazy loading
9. **Monitoring** : logs, alertes, analytics

---

## 📈 Historique des Jalons

| Date | Jalon | Statut |
|------|-------|--------|
| Oct 2025 | Initialisation projet Node.js + Express + PostgreSQL | ✅ |
| Oct 2025 | Schéma DB migrations/001_schema.sql | ✅ |
| Oct 2025 | Routes de base (/, /admins) | ✅ |
| - | Configuration tests (Jest/Playwright) | 📋 TODO |
| - | Authentification JWT | 📋 TODO |
| - | CRUD Blocs | 📋 TODO |
| - | Dashboard Admin | 📋 TODO |
| - | PWA (Manifest + SW) | 📋 TODO |
| - | Déploiement NAS | 📋 TODO |

---

## 🎓 Notes pour les Développeurs

### Ce qui fonctionne actuellement
- ✅ Serveur Express démarre sur port 3000
- ✅ Connexion PostgreSQL configurée (pool + query helper)
- ✅ Routes GET `/` et GET `/admins` fonctionnelles
- ✅ Vues Pug `index.pug` et `layout.pug` rendues
- ✅ Schéma DB avec tables admins, blocks, refresh_tokens, etc.
- ✅ Docker-compose.yml avec services app + db

### Ce qui manque (bloquant)
- ❌ **Aucun test** (ni unitaire ni E2E)
- ❌ **Aucune authentification** (routes admin non protégées)
- ❌ **Aucune validation** des entrées (risque XSS/injection)
- ❌ **Pas de Dockerfile** (docker-compose ne peut pas build)
- ❌ **Pas de CI/CD** (GitHub Actions)
- ❌ **Pas de CSS** (site non stylisé)

### Commandes disponibles
```bash
npm start          # Production (node src/server.js)
npm run dev        # Dev avec nodemon
npm test           # Jest (non configuré)
npm run e2e        # Playwright (non configuré)
npm run lint       # ESLint (non configuré)
npm run build:docker  # Build Docker (Dockerfile manquant)
```

---

**Dernière mise à jour** : 24 octobre 2025  
**Prochaine revue prévue** : Fin Sprint 1 (dans 7 jours)
