# User Stories - Batala LR

## 📖 Légende des statuts
- ✅ **DONE** : Implémenté et testé
- 🚧 **IN_PROGRESS** : En cours de développement
- 📋 **TODO** : À faire
- ⏸️ **BLOCKED** : Bloqué (dépendance non résolue)

---

## Epic 1 : Infrastructure & Configuration

### US1.1 : Initialiser le projet Node.js + Express + Pug + PostgreSQL
**Statut** : ✅ DONE  
**Description** : En tant que développeur, je veux un projet Node.js configuré avec Express, Pug et PostgreSQL pour pouvoir démarrer le développement.

**Critères d'acceptation** :
- [x] `package.json` avec dépendances Express, Pug, pg, dotenv
- [x] `src/server.js` démarre un serveur Express
- [x] `src/config/db.js` configure la connexion PostgreSQL
- [x] `migrations/001_schema.sql` contient le schéma initial
- [x] Structure de dossiers : `src/routes`, `src/controllers`, `src/views`

**Tâches** :
- [x] Initialiser npm et installer dépendances
- [x] Créer serveur Express de base
- [x] Configurer pool PostgreSQL
- [x] Créer migration initiale

---

### US1.2 : Ajouter ESM, Jest, Playwright
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux configurer ESM, Jest pour les tests unitaires et Playwright pour les tests E2E.

**Critères d'acceptation** :
- [ ] `package.json` avec `"type": "module"` ✅ (déjà fait)
- [ ] `jest.config.js` configuré pour ESM
- [ ] `playwright.config.js` configuré
- [ ] Au moins 1 test unitaire fonctionnel
- [ ] Au moins 1 test E2E fonctionnel

**Tâches** :
- [x] Ajouter `"type": "module"` dans package.json
- [ ] Créer `jest.config.js` avec support ESM
- [ ] Créer `playwright.config.js`
- [ ] Créer `tests/unit/` et `tests/e2e/`
- [ ] Écrire test unitaire exemple (homeController)
- [ ] Écrire test E2E exemple (page d'accueil)

---

### US1.3 : Configurer ESLint et Prettier
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux un linting cohérent pour maintenir la qualité du code.

**Critères d'acceptation** :
- [ ] `eslint.config.js` configuré (flat config)
- [ ] `.prettierrc` configuré
- [ ] `npm run lint` fonctionne
- [ ] Pas d'erreurs ESLint sur le code existant

**Tâches** :
- [ ] Créer `eslint.config.js` avec règles pour ESM
- [ ] Créer `.prettierrc`
- [ ] Ajouter scripts lint dans package.json
- [ ] Corriger les erreurs de lint existantes

---

### US1.4 : Ajouter gestion .env (dotenv)
**Statut** : ✅ DONE  
**Description** : En tant que développeur, je veux gérer les variables d'environnement via .env.

**Critères d'acceptation** :
- [x] `dotenv` installé et configuré
- [x] `.env` en .gitignore
- [ ] `.env.example` documenté
- [x] Variables DB utilisées dans `src/config/db.js`

**Tâches** :
- [x] Installer dotenv
- [x] Configurer dotenv dans server.js et db.js
- [ ] Créer `.env.example` avec toutes les variables requises
- [x] Ajouter .env au .gitignore

---

### US1.5 : Mettre en place Dockerfile + docker-compose.yml
**Statut** : 🚧 IN_PROGRESS  
**Description** : En tant que développeur, je veux conteneuriser l'application pour faciliter le déploiement.

**Critères d'acceptation** :
- [ ] `Dockerfile` multi-stage pour prod
- [x] `docker-compose.yml` avec services app + db
- [ ] `docker-compose up` démarre l'app fonctionnelle
- [ ] Volumes configurés pour persistence

**Tâches** :
- [ ] Créer Dockerfile avec Node 24
- [x] Créer docker-compose.yml
- [ ] Tester build et run local
- [ ] Documenter usage Docker dans README

---

### US1.6 : Configurer GitHub Actions (lint, test, audit, build, push Docker)
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux une CI/CD automatisée sur GitHub Actions.

**Critères d'acceptation** :
- [ ] `.github/workflows/ci.yml` avec jobs lint, test, audit
- [ ] `.github/workflows/build.yml` pour build et push Docker
- [ ] CI déclenché sur PR et merge main
- [ ] Badge de build dans README

**Tâches** :
- [ ] Créer workflow CI (lint + test + audit)
- [ ] Créer workflow build Docker
- [ ] Configurer secrets GitHub (Docker Hub)
- [ ] Ajouter badges dans README

---

### US1.7 : Configurer SonarCloud & Lighthouse
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux analyser la qualité du code (SonarCloud) et les performances (Lighthouse).

**Critères d'acceptation** :
- [ ] SonarCloud configuré et analyse le projet
- [ ] Lighthouse CI configuré
- [ ] `npm run lhci:collect` et `npm run lhci:assert` fonctionnent
- [ ] Rapport qualité visible dans PR

**Tâches** :
- [ ] Créer projet SonarCloud
- [ ] Ajouter sonar-scanner dans CI
- [ ] Configurer Lighthouse CI
- [ ] Ajouter assertion performance >= 0.9

---

### US1.8 : Configurer GitHub Copilot (workspace instructions, PR reviews)
**Statut** : 🚧 IN_PROGRESS  
**Description** : En tant que développeur, je veux utiliser GitHub Copilot Pro pour améliorer ma productivité avec l'assistance IA et les revues de PR.

**Critères d'acceptation** :
- [x] GitHub Copilot Pro activé
- [x] `.github/copilot-instructions.md` existe avec patterns du projet
- [x] User stories et plan projet documentés (.continue/rules/)
- [ ] Workflow de branche défini (feature/epic-X-usY)
- [ ] GitHub Projects configuré pour tracking des US

**Tâches** :
- [x] Activer souscription GitHub Copilot Pro
- [x] Créer `.github/copilot-instructions.md`
- [x] Créer PROJECT_PLAN.md et USER_STORIES.md
- [ ] Configurer GitHub Projects avec les epics et user stories
- [ ] Documenter workflow Git dans README

---

## Epic 2 : Authentification et Sécurité

### US2.1 : Authentification JWT + Refresh Token (HttpOnly)
**Statut** : 📋 TODO  
**Description** : En tant qu'admin, je veux me connecter avec un email/mot de passe et recevoir un JWT + refresh token sécurisé.

**Critères d'acceptation** :
- [ ] Route POST `/auth/login` valide email + password
- [ ] Retourne access token (JWT court) + refresh token (HttpOnly cookie)
- [ ] Route POST `/auth/refresh` renouvelle l'access token
- [ ] Route POST `/auth/logout` invalide le refresh token
- [ ] Middleware `authMiddleware` vérifie le JWT

**Tâches** :
- [ ] Créer `src/controllers/authController.js`
- [ ] Créer routes `/auth/login`, `/auth/refresh`, `/auth/logout`
- [ ] Créer `src/middlewares/authMiddleware.js`
- [ ] Stocker refresh tokens en DB avec expiration
- [ ] Écrire tests unitaires pour authController
- [ ] Écrire test E2E pour login/logout

---

### US2.2 : Mot de passe hashé avec Argon2id
**Statut** : 📋 TODO  
**Description** : En tant qu'admin, je veux que mon mot de passe soit hashé avec Argon2id.

**Critères d'acceptation** :
- [ ] Argon2 installé et utilisé
- [ ] Fonction `hashPassword(password)` dans utils
- [ ] Fonction `verifyPassword(password, hash)` dans utils
- [ ] Migration pour ajouter un admin avec password hashé
- [ ] Tests unitaires pour hash/verify

**Tâches** :
- [ ] Créer `src/utils/password.js` avec argon2
- [ ] Intégrer hash dans authController.login
- [ ] Créer test unitaire password.test.js

---

### US2.3 : Gestion utilisateurs admin (création, invitation par email)
**Statut** : 📋 TODO  
**Description** : En tant qu'admin connecté, je veux créer un nouvel admin et lui envoyer un email d'invitation.

**Critères d'acceptation** :
- [ ] Route POST `/admins` (protégée) crée un admin sans mot de passe
- [ ] Génère un token d'invitation (JWT court, 24h)
- [ ] Envoie email avec lien `/auth/set-password?token=xxx`
- [ ] Admin créé avec `is_active: false` jusqu'à validation

**Tâches** :
- [ ] Créer route POST `/admins` dans adminController
- [ ] Créer fonction `sendInvitationEmail` avec nodemailer
- [ ] Générer token d'invitation (JWT)
- [ ] Écrire test unitaire pour création admin
- [ ] Écrire test E2E pour invitation

---

### US2.4 : Page de création de mot de passe via lien email
**Statut** : 📋 TODO  
**Description** : En tant qu'admin invité, je veux définir mon mot de passe via un lien reçu par email.

**Critères d'acceptation** :
- [ ] Route GET `/auth/set-password?token=xxx` affiche formulaire Pug
- [ ] Route POST `/auth/set-password` valide token + enregistre mot de passe
- [ ] Admin passe à `is_active: true` après validation
- [ ] Token d'invitation invalide après usage

**Tâches** :
- [ ] Créer vue `src/views/set-password.pug`
- [ ] Créer route GET + POST `/auth/set-password`
- [ ] Valider et hasher le mot de passe
- [ ] Marquer token comme utilisé en DB
- [ ] Écrire test E2E pour le flow complet

---

### US2.5 : Middleware de protection des routes /dashboard
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux protéger toutes les routes admin avec un middleware.

**Critères d'acceptation** :
- [ ] Middleware `authMiddleware` vérifie JWT valide
- [ ] Si invalide, redirige vers `/auth/login`
- [ ] Ajoute `req.admin` avec les infos de l'admin
- [ ] Appliqué sur toutes les routes `/dashboard/*`

**Tâches** :
- [ ] Créer `src/middlewares/authMiddleware.js`
- [ ] Appliquer middleware sur routes admin
- [ ] Écrire test unitaire pour middleware
- [ ] Écrire test E2E pour accès refusé

---

## Epic 3 : Gestion de Contenu (CMS simplifié)

### US3.1 : CRUD des blocs dynamiques (présentation, événements, offres, carrousel)
**Statut** : 📋 TODO  
**Description** : En tant qu'admin, je veux créer/modifier/supprimer des blocs de contenu.

**Critères d'acceptation** :
- [ ] Route GET `/dashboard/blocks` liste tous les blocs
- [ ] Route GET `/dashboard/blocks/:id` affiche le formulaire d'édition
- [ ] Route POST `/dashboard/blocks` crée un nouveau bloc
- [ ] Route PUT `/dashboard/blocks/:id` modifie un bloc
- [ ] Route DELETE `/dashboard/blocks/:id` supprime un bloc (si non verrouillé)
- [ ] Validation des champs (type, title, slug)

**Tâches** :
- [ ] Créer `src/controllers/blockController.js`
- [ ] Créer routes CRUD dans `src/routes/blockRoutes.js`
- [ ] Créer vues Pug (liste, form, delete confirm)
- [ ] Ajouter validation avec express-validator
- [ ] Écrire tests unitaires pour blockController
- [ ] Écrire tests E2E pour CRUD complet

---

### US3.2 : Modification de l'ordre des blocs (drag & drop)
**Statut** : 📋 TODO  
**Description** : En tant qu'admin, je veux réordonner les blocs par drag & drop.

**Critères d'acceptation** :
- [ ] Route PUT `/dashboard/blocks/reorder` reçoit tableau de IDs
- [ ] Met à jour la colonne `position` de chaque bloc
- [ ] Interface drag & drop fonctionnelle en JS vanilla
- [ ] Feedback visuel pendant le drag

**Tâches** :
- [ ] Créer route PUT `/dashboard/blocks/reorder`
- [ ] Ajouter JS drag & drop dans vue liste blocs
- [ ] Mettre à jour positions en DB en transaction
- [ ] Écrire test unitaire pour reorder
- [ ] Écrire test E2E pour drag & drop

---

### US3.3 : Upload d'images/documents
**Statut** : 📋 TODO  
**Description** : En tant qu'admin, je veux uploader des images et documents pour les blocs.

**Critères d'acceptation** :
- [ ] Route POST `/dashboard/upload` accepte fichiers (multer)
- [ ] Validation type (jpg, png, pdf, max 5MB)
- [ ] Fichiers stockés dans `public/uploads/`
- [ ] Retourne chemin du fichier uploadé
- [ ] Nettoyage des anciens fichiers lors de suppression de bloc

**Tâches** :
- [ ] Configurer multer dans middleware
- [ ] Créer route POST `/dashboard/upload`
- [ ] Créer dossier `public/uploads/`
- [ ] Ajouter validation fichier
- [ ] Écrire test unitaire pour upload
- [ ] Écrire test E2E pour upload + affichage

---

### US3.4 : Validation et nettoyage des entrées (regex + sanitization)
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux valider et nettoyer toutes les entrées utilisateur.

**Critères d'acceptation** :
- [ ] Utilisation de `express-validator` sur toutes les routes POST/PUT
- [ ] Sanitization HTML avec bibliothèque (ex: DOMPurify ou validator)
- [ ] Validation des types, longueurs, formats
- [ ] Messages d'erreur clairs pour l'utilisateur

**Tâches** :
- [ ] Installer express-validator et validator
- [ ] Ajouter validations sur routes blocs, auth, admins
- [ ] Créer middleware de validation réutilisable
- [ ] Écrire tests unitaires pour validation

---

### US3.5 : Accessibilité ARIA + navigation clavier
**Statut** : 📋 TODO  
**Description** : En tant qu'utilisateur, je veux une interface accessible (ARIA, clavier, focus visible).

**Critères d'acceptation** :
- [ ] Balises ARIA sur éléments interactifs
- [ ] Navigation au clavier fonctionnelle (Tab, Enter, Esc)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Tests avec axe-core ou Lighthouse Accessibility >= 95

**Tâches** :
- [ ] Ajouter attributs ARIA dans vues Pug
- [ ] Tester navigation clavier
- [ ] Ajouter styles :focus-visible
- [ ] Intégrer axe-core dans tests E2E

---

## Epic 4 : Interface Utilisateur (PWA)

### US4.1 : Page publique SSR avec Hero, sections dynamiques, footer
**Statut** : 🚧 IN_PROGRESS  
**Description** : En tant que visiteur, je veux voir une page d'accueil avec header, sections dynamiques et footer.

**Critères d'acceptation** :
- [x] Route GET `/` affiche la page d'accueil
- [ ] Vue Pug avec header, sections (chargées depuis DB), footer
- [ ] Blocs affichés dans l'ordre de la colonne `position`
- [ ] Design responsive (mobile-first)

**Tâches** :
- [x] Créer route GET `/` dans homeController
- [x] Créer vue `src/views/index.pug`
- [ ] Charger blocs depuis DB et passer à la vue
- [ ] Créer vue `src/views/partials/block.pug` pour rendu dynamique
- [ ] Ajouter CSS responsive dans `public/css/style.css`

---

### US4.2 : Bouton admin SVG pour connexion
**Statut** : 📋 TODO  
**Description** : En tant que visiteur, je veux un petit bouton admin discret en SVG pour accéder au login.

**Critères d'acceptation** :
- [ ] Bouton SVG (ex: icône cadenas) dans le footer
- [ ] Lien vers `/auth/login`
- [ ] Style discret (petit, coin inférieur)

**Tâches** :
- [ ] Créer SVG admin icon
- [ ] Ajouter bouton dans layout.pug (footer)
- [ ] Styler avec CSS

---

### US4.3 : Dashboard admin avec gestion des blocs
**Statut** : 📋 TODO  
**Description** : En tant qu'admin connecté, je veux un dashboard avec liste et gestion des blocs.

**Critères d'acceptation** :
- [ ] Route GET `/dashboard` affiche le dashboard
- [ ] Vue Pug avec menu (blocs, admins, paramètres)
- [ ] Liste des blocs avec boutons éditer/supprimer
- [ ] Navigation claire et responsive

**Tâches** :
- [ ] Créer route GET `/dashboard` dans dashboardController
- [ ] Créer vue `src/views/dashboard.pug`
- [ ] Créer menu de navigation
- [ ] Ajouter CSS pour dashboard

---

### US4.4 : Animation fluide et transitions légères (CSS)
**Statut** : 📋 TODO  
**Description** : En tant qu'utilisateur, je veux des transitions CSS douces pour une meilleure UX.

**Critères d'acceptation** :
- [ ] Transitions sur hover, focus, click (boutons, liens)
- [ ] Fade-in sur chargement des sections
- [ ] Pas d'animations trop longues (< 300ms)

**Tâches** :
- [ ] Ajouter transitions CSS dans style.css
- [ ] Tester performance sur mobile
- [ ] Respecter prefers-reduced-motion

---

### US4.5 : Bouton scroll-to-top SVG
**Statut** : 📋 TODO  
**Description** : En tant qu'utilisateur, je veux un bouton pour remonter en haut de page.

**Critères d'acceptation** :
- [ ] Bouton SVG (flèche haut) apparaît après scroll > 300px
- [ ] Scroll smooth vers le haut au clic
- [ ] Accessible au clavier

**Tâches** :
- [ ] Créer SVG scroll-to-top
- [ ] Ajouter JS pour afficher/masquer le bouton
- [ ] Ajouter smooth scroll

---

### US4.6 : Manifest + Service Worker (offline + installable)
**Statut** : 📋 TODO  
**Description** : En tant qu'utilisateur mobile, je veux installer l'app en PWA et accéder hors-ligne.

**Critères d'acceptation** :
- [ ] `public/manifest.webmanifest` avec nom, icônes, thème
- [ ] Service worker enregistré dans layout.pug
- [ ] Cache des assets statiques (CSS, JS, images)
- [ ] Installation PWA fonctionnelle sur mobile

**Tâches** :
- [ ] Créer manifest.webmanifest
- [ ] Créer service-worker.js avec stratégie cache-first
- [ ] Enregistrer SW dans layout.pug
- [ ] Générer icônes PWA (192x192, 512x512)
- [ ] Tester installation sur mobile

---

## Epic 5 : Tests & Qualité

### US5.1 : Tests unitaires TDD (Jest)
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux des tests unitaires pour tous les contrôleurs et fonctions critiques.

**Critères d'acceptation** :
- [ ] Coverage >= 80% pour `src/controllers` et `src/utils`
- [ ] Tests pour authController, blockController, adminController
- [ ] Tests pour utils (password, validation)
- [ ] `npm test` passe sans erreur

**Tâches** :
- [ ] Créer `tests/unit/controllers/` avec tests pour chaque contrôleur
- [ ] Créer `tests/unit/utils/` pour utils
- [ ] Configurer Jest pour ESM
- [ ] Ajouter mocks pour DB (pg)
- [ ] Intégrer coverage dans CI

---

### US5.2 : Tests E2E pour flux critiques (Playwright)
**Statut** : 📋 TODO  
**Description** : En tant que développeur, je veux des tests E2E pour les parcours utilisateurs critiques.

**Critères d'acceptation** :
- [ ] Test E2E : visiteur voit la page d'accueil
- [ ] Test E2E : admin se connecte et accède au dashboard
- [ ] Test E2E : admin crée/modifie/supprime un bloc
- [ ] Test E2E : admin réordonne les blocs
- [ ] `npm run e2e` passe sans erreur

**Tâches** :
- [ ] Créer `tests/e2e/` avec tests Playwright
- [ ] Configurer Playwright pour tester contre localhost
- [ ] Écrire test E2E pour page publique
- [ ] Écrire test E2E pour login/dashboard
- [ ] Écrire test E2E pour CRUD blocs
- [ ] Intégrer E2E dans CI

---

## 📊 Récapitulatif des statuts

| Epic | US Total | ✅ DONE | 🚧 IN_PROGRESS | 📋 TODO | ⏸️ BLOCKED |
|------|----------|---------|----------------|---------|-----------|
| Epic 1 : Infrastructure & Configuration | 8 | 2 | 2 | 4 | 0 |
| Epic 2 : Authentification et Sécurité | 5 | 0 | 0 | 5 | 0 |
| Epic 3 : Gestion de Contenu | 5 | 0 | 0 | 5 | 0 |
| Epic 4 : Interface Utilisateur (PWA) | 6 | 0 | 1 | 5 | 0 |
| Epic 5 : Tests & Qualité | 2 | 0 | 0 | 2 | 0 |
| **TOTAL** | **26** | **2** | **3** | **21** | **0** |

**Progression globale** : 7.7% (2/26 complétées)
