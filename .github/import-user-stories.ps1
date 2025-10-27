# Script PowerShell pour créer les issues GitHub à partir des User Stories
# Nécessite: GitHub CLI (gh) installé et authentifié

# Configuration
$REPO = "Jean-Charles-Audebert/batala-vitrine"
$PROJECT_NUMBER = 1  # À ajuster selon votre numéro de projet

# Fonction pour créer une issue et l'ajouter au projet
function New-UserStoryIssue {
    param(
        [string]$Title,
        [string]$Body,
        [string[]]$Labels,
        [string]$Milestone
    )
    
    Write-Host "Création de l'issue: $Title" -ForegroundColor Cyan
    
    # Créer l'issue
    $labelsParam = $Labels -join ","
    $issue = gh issue create --repo $REPO --title $Title --body $Body --label $labelsParam
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Issue créée: $issue" -ForegroundColor Green
        
        # Extraire le numéro d'issue
        $issueNumber = $issue -replace ".*#(\d+).*", '$1'
        
        # Ajouter l'issue au projet (optionnel, nécessite GitHub CLI >= 2.0)
        # gh project item-add $PROJECT_NUMBER --owner Jean-Charles-Audebert --url $issue
        
        return $issueNumber
    } else {
        Write-Host "✗ Erreur lors de la création de l'issue" -ForegroundColor Red
        return $null
    }
}

Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "Import des User Stories dans GitHub" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

# Vérifier que gh est installé
try {
    gh --version | Out-Null
} catch {
    Write-Host "❌ GitHub CLI (gh) n'est pas installé." -ForegroundColor Red
    Write-Host "Installez-le depuis: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Vérifier l'authentification
Write-Host "Vérification de l'authentification GitHub..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Non authentifié. Exécutez: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Début de l'import des user stories..." -ForegroundColor Green
Write-Host ""

# Epic 1: Infrastructure & Configuration
Write-Host "=== Epic 1: Infrastructure & Configuration ===" -ForegroundColor Magenta

$us11 = @{
    Title = "[US1.1] Initialiser le projet Node.js + Express + Pug + PostgreSQL"
    Body = @"
## Description
En tant que développeur, je veux un projet Node.js configuré avec Express, Pug et PostgreSQL pour pouvoir démarrer le développement.

## Critères d'acceptation
- [x] ``package.json`` avec dépendances Express, Pug, pg, dotenv
- [x] ``src/server.js`` démarre un serveur Express
- [x] ``src/config/db.js`` configure la connexion PostgreSQL
- [x] ``migrations/001_schema.sql`` contient le schéma initial
- [x] Structure de dossiers : ``src/routes``, ``src/controllers``, ``src/views``

## Tâches
- [x] Initialiser npm et installer dépendances
- [x] Créer serveur Express de base
- [x] Configurer pool PostgreSQL
- [x] Créer migration initiale

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P0  
**Statut**: ✅ DONE
"@
    Labels = @("epic-1", "infrastructure", "done", "priority-p0")
}

$us12 = @{
    Title = "[US1.2] Ajouter ESM, Jest, Playwright"
    Body = @"
## Description
En tant que développeur, je veux configurer ESM, Jest pour les tests unitaires et Playwright pour les tests E2E.

## Critères d'acceptation
- [x] ``package.json`` avec ``"type": "module"``
- [ ] ``jest.config.js`` configuré pour ESM
- [ ] ``playwright.config.js`` configuré
- [ ] Au moins 1 test unitaire fonctionnel
- [ ] Au moins 1 test E2E fonctionnel

## Tâches
- [x] Ajouter ``"type": "module"`` dans package.json
- [ ] Créer ``jest.config.js`` avec support ESM
- [ ] Créer ``playwright.config.js``
- [ ] Créer ``tests/unit/`` et ``tests/e2e/``
- [ ] Écrire test unitaire exemple (homeController)
- [ ] Écrire test E2E exemple (page d'accueil)

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-1", "infrastructure", "testing", "priority-p0")
}

$us13 = @{
    Title = "[US1.3] Configurer ESLint et Prettier"
    Body = @"
## Description
En tant que développeur, je veux un linting cohérent pour maintenir la qualité du code.

## Critères d'acceptation
- [ ] ``eslint.config.js`` configuré (flat config)
- [ ] ``.prettierrc`` configuré
- [ ] ``npm run lint`` fonctionne
- [ ] Pas d'erreurs ESLint sur le code existant

## Tâches
- [ ] Créer ``eslint.config.js`` avec règles pour ESM
- [ ] Créer ``.prettierrc``
- [ ] Ajouter scripts lint dans package.json
- [ ] Corriger les erreurs de lint existantes

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-1", "infrastructure", "code-quality", "priority-p1")
}

$us14 = @{
    Title = "[US1.4] Ajouter gestion .env (dotenv)"
    Body = @"
## Description
En tant que développeur, je veux gérer les variables d'environnement via .env.

## Critères d'acceptation
- [x] ``dotenv`` installé et configuré
- [x] ``.env`` en .gitignore
- [ ] ``.env.example`` documenté
- [x] Variables DB utilisées dans ``src/config/db.js``

## Tâches
- [x] Installer dotenv
- [x] Configurer dotenv dans server.js et db.js
- [ ] Créer ``.env.example`` avec toutes les variables requises
- [x] Ajouter .env au .gitignore

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P0  
**Statut**: ✅ DONE
"@
    Labels = @("epic-1", "infrastructure", "done", "priority-p0")
}

$us15 = @{
    Title = "[US1.5] Mettre en place Dockerfile + docker-compose.yml"
    Body = @"
## Description
En tant que développeur, je veux conteneuriser l'application pour faciliter le déploiement.

## Critères d'acceptation
- [ ] ``Dockerfile`` multi-stage pour prod
- [x] ``docker-compose.yml`` avec services app + db
- [ ] ``docker-compose up`` démarre l'app fonctionnelle
- [ ] Volumes configurés pour persistence

## Tâches
- [ ] Créer Dockerfile avec Node 24
- [x] Créer docker-compose.yml
- [ ] Tester build et run local
- [ ] Documenter usage Docker dans README

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P1  
**Statut**: 🚧 IN_PROGRESS
"@
    Labels = @("epic-1", "infrastructure", "docker", "in-progress", "priority-p1")
}

$us16 = @{
    Title = "[US1.6] Configurer GitHub Actions (lint, test, audit, build, push Docker)"
    Body = @"
## Description
En tant que développeur, je veux une CI/CD automatisée sur GitHub Actions.

## Critères d'acceptation
- [ ] ``.github/workflows/ci.yml`` avec jobs lint, test, audit
- [ ] ``.github/workflows/build.yml`` pour build et push Docker
- [ ] CI déclenché sur PR et merge main
- [ ] Badge de build dans README

## Tâches
- [ ] Créer workflow CI (lint + test + audit)
- [ ] Créer workflow build Docker
- [ ] Configurer secrets GitHub (Docker Hub)
- [ ] Ajouter badges dans README

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-1", "infrastructure", "ci-cd", "priority-p2")
}

$us17 = @{
    Title = "[US1.7] Configurer SonarCloud & Lighthouse"
    Body = @"
## Description
En tant que développeur, je veux analyser la qualité du code (SonarCloud) et les performances (Lighthouse).

## Critères d'acceptation
- [ ] SonarCloud configuré et analyse le projet
- [ ] Lighthouse CI configuré
- [ ] ``npm run lhci:collect`` et ``npm run lhci:assert`` fonctionnent
- [ ] Rapport qualité visible dans PR

## Tâches
- [ ] Créer projet SonarCloud
- [ ] Ajouter sonar-scanner dans CI
- [ ] Configurer Lighthouse CI
- [ ] Ajouter assertion performance >= 0.9

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-1", "infrastructure", "code-quality", "priority-p2")
}

$us18 = @{
    Title = "[US1.8] Configurer GitHub Copilot Pro + GitHub Projects"
    Body = @"
## Description
En tant que développeur, je veux utiliser GitHub Copilot Pro pour améliorer ma productivité avec l'assistance IA et les revues de PR.

## Critères d'acceptation
- [x] GitHub Copilot Pro activé
- [x] ``.github/copilot-instructions.md`` existe avec patterns du projet
- [x] User stories et plan projet documentés (.continue/rules/)
- [ ] Workflow de branche défini (feature/epic-X-usY)
- [ ] GitHub Projects configuré pour tracking des US

## Tâches
- [x] Activer souscription GitHub Copilot Pro
- [x] Créer ``.github/copilot-instructions.md``
- [x] Créer PROJECT_PLAN.md et USER_STORIES.md
- [ ] Configurer GitHub Projects avec les epics et user stories
- [ ] Documenter workflow Git dans README

**Epic**: Epic 1 - Infrastructure & Configuration  
**Priorité**: P2  
**Statut**: 🚧 IN_PROGRESS
"@
    Labels = @("epic-1", "infrastructure", "in-progress", "priority-p2")
}

# Epic 2: Authentification et Sécurité
Write-Host "=== Epic 2: Authentification et Sécurité ===" -ForegroundColor Magenta

$us21 = @{
    Title = "[US2.1] Authentification JWT + Refresh Token (HttpOnly)"
    Body = @"
## Description
En tant qu'admin, je veux me connecter avec un email/mot de passe et recevoir un JWT + refresh token sécurisé.

## Critères d'acceptation
- [ ] Route POST ``/auth/login`` valide email + password
- [ ] Retourne access token (JWT court) + refresh token (HttpOnly cookie)
- [ ] Route POST ``/auth/refresh`` renouvelle l'access token
- [ ] Route POST ``/auth/logout`` invalide le refresh token
- [ ] Middleware ``authMiddleware`` vérifie le JWT

## Tâches
- [ ] Créer ``src/controllers/authController.js``
- [ ] Créer routes ``/auth/login``, ``/auth/refresh``, ``/auth/logout``
- [ ] Créer ``src/middlewares/authMiddleware.js``
- [ ] Stocker refresh tokens en DB avec expiration
- [ ] Écrire tests unitaires pour authController
- [ ] Écrire test E2E pour login/logout

**Epic**: Epic 2 - Authentification et Sécurité  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-2", "authentication", "security", "priority-p0")
}

$us22 = @{
    Title = "[US2.2] Mot de passe hashé avec Argon2id"
    Body = @"
## Description
En tant qu'admin, je veux que mon mot de passe soit hashé avec Argon2id.

## Critères d'acceptation
- [ ] Argon2 installé et utilisé
- [ ] Fonction ``hashPassword(password)`` dans utils
- [ ] Fonction ``verifyPassword(password, hash)`` dans utils
- [ ] Migration pour ajouter un admin avec password hashé
- [ ] Tests unitaires pour hash/verify

## Tâches
- [ ] Créer ``src/utils/password.js`` avec argon2
- [ ] Intégrer hash dans authController.login
- [ ] Créer test unitaire password.test.js

**Epic**: Epic 2 - Authentification et Sécurité  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-2", "authentication", "security", "priority-p0")
}

$us23 = @{
    Title = "[US2.3] Gestion utilisateurs admin (création, invitation par email)"
    Body = @"
## Description
En tant qu'admin connecté, je veux créer un nouvel admin et lui envoyer un email d'invitation.

## Critères d'acceptation
- [ ] Route POST ``/admins`` (protégée) crée un admin sans mot de passe
- [ ] Génère un token d'invitation (JWT court, 24h)
- [ ] Envoie email avec lien ``/auth/set-password?token=xxx``
- [ ] Admin créé avec ``is_active: false`` jusqu'à validation

## Tâches
- [ ] Créer route POST ``/admins`` dans adminController
- [ ] Créer fonction ``sendInvitationEmail`` avec nodemailer
- [ ] Générer token d'invitation (JWT)
- [ ] Écrire test unitaire pour création admin
- [ ] Écrire test E2E pour invitation

**Epic**: Epic 2 - Authentification et Sécurité  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-2", "authentication", "admin", "priority-p1")
}

$us24 = @{
    Title = "[US2.4] Page de création de mot de passe via lien email"
    Body = @"
## Description
En tant qu'admin invité, je veux définir mon mot de passe via un lien reçu par email.

## Critères d'acceptation
- [ ] Route GET ``/auth/set-password?token=xxx`` affiche formulaire Pug
- [ ] Route POST ``/auth/set-password`` valide token + enregistre mot de passe
- [ ] Admin passe à ``is_active: true`` après validation
- [ ] Token d'invitation invalide après usage

## Tâches
- [ ] Créer vue ``src/views/set-password.pug``
- [ ] Créer route GET + POST ``/auth/set-password``
- [ ] Valider et hasher le mot de passe
- [ ] Marquer token comme utilisé en DB
- [ ] Écrire test E2E pour le flow complet

**Epic**: Epic 2 - Authentification et Sécurité  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-2", "authentication", "ui", "priority-p1")
}

$us25 = @{
    Title = "[US2.5] Middleware de protection des routes /dashboard"
    Body = @"
## Description
En tant que développeur, je veux protéger toutes les routes admin avec un middleware.

## Critères d'acceptation
- [ ] Middleware ``authMiddleware`` vérifie JWT valide
- [ ] Si invalide, redirige vers ``/auth/login``
- [ ] Ajoute ``req.admin`` avec les infos de l'admin
- [ ] Appliqué sur toutes les routes ``/dashboard/*``

## Tâches
- [ ] Créer ``src/middlewares/authMiddleware.js``
- [ ] Appliquer middleware sur routes admin
- [ ] Écrire test unitaire pour middleware
- [ ] Écrire test E2E pour accès refusé

**Epic**: Epic 2 - Authentification et Sécurité  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-2", "authentication", "security", "priority-p0")
}

# Epic 3: Gestion de Contenu
Write-Host "=== Epic 3: Gestion de Contenu ===" -ForegroundColor Magenta

$us31 = @{
    Title = "[US3.1] CRUD des blocs dynamiques (présentation, événements, offres, carrousel)"
    Body = @"
## Description
En tant qu'admin, je veux créer/modifier/supprimer des blocs de contenu.

## Critères d'acceptation
- [ ] Route GET ``/dashboard/blocks`` liste tous les blocs
- [ ] Route GET ``/dashboard/blocks/:id`` affiche le formulaire d'édition
- [ ] Route POST ``/dashboard/blocks`` crée un nouveau bloc
- [ ] Route PUT ``/dashboard/blocks/:id`` modifie un bloc
- [ ] Route DELETE ``/dashboard/blocks/:id`` supprime un bloc (si non verrouillé)
- [ ] Validation des champs (type, title, slug)

## Tâches
- [ ] Créer ``src/controllers/blockController.js``
- [ ] Créer routes CRUD dans ``src/routes/blockRoutes.js``
- [ ] Créer vues Pug (liste, form, delete confirm)
- [ ] Ajouter validation avec express-validator
- [ ] Écrire tests unitaires pour blockController
- [ ] Écrire tests E2E pour CRUD complet

**Epic**: Epic 3 - Gestion de Contenu  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-3", "cms", "crud", "priority-p0")
}

$us32 = @{
    Title = "[US3.2] Modification de l'ordre des blocs (drag & drop)"
    Body = @"
## Description
En tant qu'admin, je veux réordonner les blocs par drag & drop.

## Critères d'acceptation
- [ ] Route PUT ``/dashboard/blocks/reorder`` reçoit tableau de IDs
- [ ] Met à jour la colonne ``position`` de chaque bloc
- [ ] Interface drag & drop fonctionnelle en JS vanilla
- [ ] Feedback visuel pendant le drag

## Tâches
- [ ] Créer route PUT ``/dashboard/blocks/reorder``
- [ ] Ajouter JS drag & drop dans vue liste blocs
- [ ] Mettre à jour positions en DB en transaction
- [ ] Écrire test unitaire pour reorder
- [ ] Écrire test E2E pour drag & drop

**Epic**: Epic 3 - Gestion de Contenu  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-3", "cms", "ui", "priority-p1")
}

$us33 = @{
    Title = "[US3.3] Upload d'images/documents"
    Body = @"
## Description
En tant qu'admin, je veux uploader des images et documents pour les blocs.

## Critères d'acceptation
- [ ] Route POST ``/dashboard/upload`` accepte fichiers (multer)
- [ ] Validation type (jpg, png, pdf, max 5MB)
- [ ] Fichiers stockés dans ``public/uploads/``
- [ ] Retourne chemin du fichier uploadé
- [ ] Nettoyage des anciens fichiers lors de suppression de bloc

## Tâches
- [ ] Configurer multer dans middleware
- [ ] Créer route POST ``/dashboard/upload``
- [ ] Créer dossier ``public/uploads/``
- [ ] Ajouter validation fichier
- [ ] Écrire test unitaire pour upload
- [ ] Écrire test E2E pour upload + affichage

**Epic**: Epic 3 - Gestion de Contenu  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-3", "cms", "upload", "priority-p1")
}

$us34 = @{
    Title = "[US3.4] Validation et nettoyage des entrées (regex + sanitization)"
    Body = @"
## Description
En tant que développeur, je veux valider et nettoyer toutes les entrées utilisateur.

## Critères d'acceptation
- [ ] Utilisation de ``express-validator`` sur toutes les routes POST/PUT
- [ ] Sanitization HTML avec bibliothèque (ex: DOMPurify ou validator)
- [ ] Validation des types, longueurs, formats
- [ ] Messages d'erreur clairs pour l'utilisateur

## Tâches
- [ ] Installer express-validator et validator
- [ ] Ajouter validations sur routes blocs, auth, admins
- [ ] Créer middleware de validation réutilisable
- [ ] Écrire tests unitaires pour validation

**Epic**: Epic 3 - Gestion de Contenu  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-3", "security", "validation", "priority-p0")
}

$us35 = @{
    Title = "[US3.5] Accessibilité ARIA + navigation clavier"
    Body = @"
## Description
En tant qu'utilisateur, je veux une interface accessible (ARIA, clavier, focus visible).

## Critères d'acceptation
- [ ] Balises ARIA sur éléments interactifs
- [ ] Navigation au clavier fonctionnelle (Tab, Enter, Esc)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Tests avec axe-core ou Lighthouse Accessibility >= 95

## Tâches
- [ ] Ajouter attributs ARIA dans vues Pug
- [ ] Tester navigation clavier
- [ ] Ajouter styles :focus-visible
- [ ] Intégrer axe-core dans tests E2E

**Epic**: Epic 3 - Gestion de Contenu  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-3", "accessibility", "a11y", "priority-p2")
}

# Epic 4: Interface Utilisateur (PWA)
Write-Host "=== Epic 4: Interface Utilisateur (PWA) ===" -ForegroundColor Magenta

$us41 = @{
    Title = "[US4.1] Page publique SSR avec Hero, sections dynamiques, footer"
    Body = @"
## Description
En tant que visiteur, je veux voir une page d'accueil avec header, sections dynamiques et footer.

## Critères d'acceptation
- [x] Route GET ``/`` affiche la page d'accueil
- [ ] Vue Pug avec header, sections (chargées depuis DB), footer
- [ ] Blocs affichés dans l'ordre de la colonne ``position``
- [ ] Design responsive (mobile-first)

## Tâches
- [x] Créer route GET ``/`` dans homeController
- [x] Créer vue ``src/views/index.pug``
- [ ] Charger blocs depuis DB et passer à la vue
- [ ] Créer vue ``src/views/partials/block.pug`` pour rendu dynamique
- [ ] Ajouter CSS responsive dans ``public/css/style.css``

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P0  
**Statut**: 🚧 IN_PROGRESS
"@
    Labels = @("epic-4", "ui", "pwa", "in-progress", "priority-p0")
}

$us42 = @{
    Title = "[US4.2] Bouton admin SVG pour connexion"
    Body = @"
## Description
En tant que visiteur, je veux un petit bouton admin discret en SVG pour accéder au login.

## Critères d'acceptation
- [ ] Bouton SVG (ex: icône cadenas) dans le footer
- [ ] Lien vers ``/auth/login``
- [ ] Style discret (petit, coin inférieur)

## Tâches
- [ ] Créer SVG admin icon
- [ ] Ajouter bouton dans layout.pug (footer)
- [ ] Styler avec CSS

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-4", "ui", "priority-p1")
}

$us43 = @{
    Title = "[US4.3] Dashboard admin avec gestion des blocs"
    Body = @"
## Description
En tant qu'admin connecté, je veux un dashboard avec liste et gestion des blocs.

## Critères d'acceptation
- [ ] Route GET ``/dashboard`` affiche le dashboard
- [ ] Vue Pug avec menu (blocs, admins, paramètres)
- [ ] Liste des blocs avec boutons éditer/supprimer
- [ ] Navigation claire et responsive

## Tâches
- [ ] Créer route GET ``/dashboard`` dans dashboardController
- [ ] Créer vue ``src/views/dashboard.pug``
- [ ] Créer menu de navigation
- [ ] Ajouter CSS pour dashboard

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-4", "ui", "dashboard", "priority-p0")
}

$us44 = @{
    Title = "[US4.4] Animation fluide et transitions légères (CSS)"
    Body = @"
## Description
En tant qu'utilisateur, je veux des transitions CSS douces pour une meilleure UX.

## Critères d'acceptation
- [ ] Transitions sur hover, focus, click (boutons, liens)
- [ ] Fade-in sur chargement des sections
- [ ] Pas d'animations trop longues (< 300ms)

## Tâches
- [ ] Ajouter transitions CSS dans style.css
- [ ] Tester performance sur mobile
- [ ] Respecter prefers-reduced-motion

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-4", "ui", "css", "priority-p2")
}

$us45 = @{
    Title = "[US4.5] Bouton scroll-to-top SVG"
    Body = @"
## Description
En tant qu'utilisateur, je veux un bouton pour remonter en haut de page.

## Critères d'acceptation
- [ ] Bouton SVG (flèche haut) apparaît après scroll > 300px
- [ ] Scroll smooth vers le haut au clic
- [ ] Accessible au clavier

## Tâches
- [ ] Créer SVG scroll-to-top
- [ ] Ajouter JS pour afficher/masquer le bouton
- [ ] Ajouter smooth scroll

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-4", "ui", "priority-p2")
}

$us46 = @{
    Title = "[US4.6] Manifest + Service Worker (offline + installable)"
    Body = @"
## Description
En tant qu'utilisateur mobile, je veux installer l'app en PWA et accéder hors-ligne.

## Critères d'acceptation
- [ ] ``public/manifest.webmanifest`` avec nom, icônes, thème
- [ ] Service worker enregistré dans layout.pug
- [ ] Cache des assets statiques (CSS, JS, images)
- [ ] Installation PWA fonctionnelle sur mobile

## Tâches
- [ ] Créer manifest.webmanifest
- [ ] Créer service-worker.js avec stratégie cache-first
- [ ] Enregistrer SW dans layout.pug
- [ ] Générer icônes PWA (192x192, 512x512)
- [ ] Tester installation sur mobile

**Epic**: Epic 4 - Interface Utilisateur  
**Priorité**: P2  
**Statut**: 📋 TODO
"@
    Labels = @("epic-4", "pwa", "offline", "priority-p2")
}

# Epic 5: Tests & Qualité
Write-Host "=== Epic 5: Tests & Qualité ===" -ForegroundColor Magenta

$us51 = @{
    Title = "[US5.1] Tests unitaires TDD (Jest)"
    Body = @"
## Description
En tant que développeur, je veux des tests unitaires pour tous les contrôleurs et fonctions critiques.

## Critères d'acceptation
- [ ] Coverage >= 80% pour ``src/controllers`` et ``src/utils``
- [ ] Tests pour authController, blockController, adminController
- [ ] Tests pour utils (password, validation)
- [ ] ``npm test`` passe sans erreur

## Tâches
- [ ] Créer ``tests/unit/controllers/`` avec tests pour chaque contrôleur
- [ ] Créer ``tests/unit/utils/`` pour utils
- [ ] Configurer Jest pour ESM
- [ ] Ajouter mocks pour DB (pg)
- [ ] Intégrer coverage dans CI

**Epic**: Epic 5 - Tests & Qualité  
**Priorité**: P0  
**Statut**: 📋 TODO
"@
    Labels = @("epic-5", "testing", "jest", "priority-p0")
}

$us52 = @{
    Title = "[US5.2] Tests E2E pour flux critiques (Playwright)"
    Body = @"
## Description
En tant que développeur, je veux des tests E2E pour les parcours utilisateurs critiques.

## Critères d'acceptation
- [ ] Test E2E : visiteur voit la page d'accueil
- [ ] Test E2E : admin se connecte et accède au dashboard
- [ ] Test E2E : admin crée/modifie/supprime un bloc
- [ ] Test E2E : admin réordonne les blocs
- [ ] ``npm run e2e`` passe sans erreur

## Tâches
- [ ] Créer ``tests/e2e/`` avec tests Playwright
- [ ] Configurer Playwright pour tester contre localhost
- [ ] Écrire test E2E pour page publique
- [ ] Écrire test E2E pour login/dashboard
- [ ] Écrire test E2E pour CRUD blocs
- [ ] Intégrer E2E dans CI

**Epic**: Epic 5 - Tests & Qualité  
**Priorité**: P1  
**Statut**: 📋 TODO
"@
    Labels = @("epic-5", "testing", "playwright", "e2e", "priority-p1")
}

# Créer toutes les issues
$allIssues = @($us11, $us12, $us13, $us14, $us15, $us16, $us17, $us18,
               $us21, $us22, $us23, $us24, $us25,
               $us31, $us32, $us33, $us34, $us35,
               $us41, $us42, $us43, $us44, $us45, $us46,
               $us51, $us52)

$createdIssues = @()

foreach ($issue in $allIssues) {
    $issueNumber = New-UserStoryIssue -Title $issue.Title -Body $issue.Body -Labels $issue.Labels
    if ($issueNumber) {
        $createdIssues += $issueNumber
    }
    Start-Sleep -Milliseconds 500  # Pause pour éviter rate limiting
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✓ Import terminé!" -ForegroundColor Green
Write-Host "$($createdIssues.Count) issues créées" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://github.com/$REPO/issues" -ForegroundColor Cyan
Write-Host "2. Créez un GitHub Project si pas encore fait" -ForegroundColor Cyan
Write-Host "3. Ajoutez les issues au projet manuellement ou via API" -ForegroundColor Cyan
Write-Host ""
