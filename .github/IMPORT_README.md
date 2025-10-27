# Import des User Stories dans GitHub Projects

Ce dossier contient les fichiers pour importer automatiquement les 26 user stories du projet dans GitHub Issues et GitHub Projects.

## 🚀 Méthode 1 : Script PowerShell Automatique (Recommandé)

### Prérequis
1. Installer GitHub CLI : https://cli.github.com/
2. S'authentifier avec GitHub CLI :
```powershell
gh auth login
```

### Exécution
```powershell
cd .github
.\import-user-stories.ps1
```

Le script va :
- ✅ Créer automatiquement les 26 issues GitHub
- ✅ Appliquer les labels appropriés (epic-1 à epic-5, priorités, statuts)
- ✅ Ajouter le corps complet avec critères d'acceptation et tâches

### Après l'import
1. Allez sur https://github.com/Jean-Charles-Audebert/batala-vitrine/projects
2. Créez un nouveau projet (si pas encore fait) : **"Batala LR - Développement"**
3. Configurez les vues :
   - Vue par Epic (grouper par label : epic-1, epic-2, etc.)
   - Vue par Priorité (grouper par label : priority-p0, priority-p1, priority-p2)
   - Vue par Statut (grouper par label : todo, in-progress, done)
4. Ajoutez toutes les issues au projet :
   - Cliquez sur "Add items" dans le projet
   - Sélectionnez toutes les issues avec le préfixe `[US]`

---

## 📋 Méthode 2 : Import Manuel (Alternative)

Si vous préférez créer les issues manuellement ou si le script ne fonctionne pas :

### Via Interface Web GitHub
1. Allez sur https://github.com/Jean-Charles-Audebert/batala-vitrine/issues/new
2. Pour chaque user story dans `.continue/rules/USER_STORIES.md` :
   - Copiez le titre (ex: `[US1.1] Initialiser le projet Node.js...`)
   - Copiez la description complète
   - Ajoutez les labels appropriés
   - Créez l'issue

### Fichier CSV (pour import en masse)
Un fichier `user-stories.csv` est disponible pour import via outils tiers, mais GitHub ne supporte pas nativement l'import CSV pour les issues.

---

## 🏷️ Labels à Créer dans GitHub

Avant d'exécuter le script, créez ces labels dans votre repo :

### Epics
- `epic-1` - Epic 1: Infrastructure & Configuration (🔵 bleu)
- `epic-2` - Epic 2: Authentification et Sécurité (🔴 rouge)
- `epic-3` - Epic 3: Gestion de Contenu (🟢 vert)
- `epic-4` - Epic 4: Interface Utilisateur (PWA) (🟣 violet)
- `epic-5` - Epic 5: Tests & Qualité (🟡 jaune)

### Priorités
- `priority-p0` - Priorité P0 (Critique) (🔴 rouge foncé)
- `priority-p1` - Priorité P1 (Important) (🟠 orange)
- `priority-p2` - Priorité P2 (Souhaitable) (🟡 jaune)

### Statuts
- `todo` - À faire (⚪ gris)
- `in-progress` - En cours (🔵 bleu)
- `done` - Terminé (🟢 vert)
- `blocked` - Bloqué (🔴 rouge)

### Types
- `infrastructure` - Infrastructure
- `authentication` - Authentification
- `security` - Sécurité
- `cms` - CMS
- `ui` - Interface Utilisateur
- `pwa` - Progressive Web App
- `testing` - Tests
- `ci-cd` - CI/CD
- `docker` - Docker
- `code-quality` - Qualité du Code
- `accessibility` - Accessibilité (a11y)
- `admin` - Administration
- `validation` - Validation
- `upload` - Upload
- `dashboard` - Dashboard

### Commande pour créer les labels via CLI
```powershell
# Epics
gh label create "epic-1" --description "Epic 1: Infrastructure & Configuration" --color "0366d6" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "epic-2" --description "Epic 2: Authentification et Sécurité" --color "d73a4a" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "epic-3" --description "Epic 3: Gestion de Contenu" --color "0e8a16" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "epic-4" --description "Epic 4: Interface Utilisateur (PWA)" --color "5319e7" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "epic-5" --description "Epic 5: Tests & Qualité" --color "fbca04" --repo Jean-Charles-Audebert/batala-vitrine

# Priorités
gh label create "priority-p0" --description "Priorité P0 (Critique)" --color "b60205" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "priority-p1" --description "Priorité P1 (Important)" --color "ff9800" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "priority-p2" --description "Priorité P2 (Souhaitable)" --color "fef2c0" --repo Jean-Charles-Audebert/batala-vitrine

# Statuts
gh label create "todo" --description "À faire" --color "d4c5f9" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "in-progress" --description "En cours" --color "0366d6" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "done" --description "Terminé" --color "0e8a16" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "blocked" --description "Bloqué" --color "d73a4a" --repo Jean-Charles-Audebert/batala-vitrine

# Types
gh label create "infrastructure" --description "Infrastructure" --color "c2e0c6" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "authentication" --description "Authentification" --color "f9d0c4" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "security" --description "Sécurité" --color "ee0701" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "cms" --description "CMS" --color "bfdadc" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "ui" --description "Interface Utilisateur" --color "c5def5" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "pwa" --description "Progressive Web App" --color "1d76db" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "testing" --description "Tests" --color "d4c5f9" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "ci-cd" --description "CI/CD" --color "e99695" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "docker" --description "Docker" --color "0db7ed" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "code-quality" --description "Qualité du Code" --color "fbca04" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "accessibility" --description "Accessibilité (a11y)" --color "d876e3" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "admin" --description "Administration" --color "5319e7" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "validation" --description "Validation" --color "bfd4f2" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "upload" --description "Upload" --color "c2e0c6" --repo Jean-Charles-Audebert/batala-vitrine
gh label create "dashboard" --description "Dashboard" --color "0075ca" --repo Jean-Charles-Audebert/batala-vitrine
```

---

## 📊 Structure du GitHub Project Recommandée

### Vues à Créer

#### 1. Vue "Par Epic" (Kanban)
- Grouper par : Label (epic-1, epic-2, epic-3, epic-4, epic-5)
- Colonnes : TODO / IN PROGRESS / DONE
- Permet de voir l'avancement par epic

#### 2. Vue "Par Priorité" (Table)
- Grouper par : Label (priority-p0, priority-p1, priority-p2)
- Filtrer : Status != Done
- Trier par : Created Date (asc)
- Permet de prioriser les tâches

#### 3. Vue "Sprint Actuel" (Kanban)
- Filtrer : Labels contient in-progress OU todo
- Filtrer : Priority = p0 OU p1
- Colonnes : TODO / IN PROGRESS / REVIEW / DONE
- Pour le travail quotidien

#### 4. Vue "Timeline" (Roadmap)
- Affichage : Roadmap
- Grouper par : Epic
- Permet de visualiser la progression dans le temps

### Champs Personnalisés Recommandés
- **Effort** (Number) : Estimation en points (1, 2, 3, 5, 8)
- **Sprint** (Iteration) : Sprint 1, Sprint 2, Sprint 3, Sprint 4
- **Epic** (Single Select) : Epic 1, Epic 2, Epic 3, Epic 4, Epic 5
- **Statut** (Single Select) : TODO / IN PROGRESS / BLOCKED / DONE

---

## 🎯 Workflow Git Recommandé

### Convention de Nommage des Branches
```
feature/epic-<N>-us<M>-<description-courte>
```

Exemples :
- `feature/epic-1-us2-configure-jest`
- `feature/epic-2-us1-jwt-authentication`
- `feature/epic-3-us1-crud-blocks`

### Workflow PR
1. Créer une branche depuis `main`
2. Développer la user story
3. Pusher et créer une PR
4. Lier la PR à l'issue GitHub (dans la description : `Closes #123`)
5. Demander une revue GitHub Copilot
6. Merger après validation

### Commits Conventionnels
```
feat(epic-1): configure Jest for ESM [US1.2]
fix(epic-2): correct JWT token expiration [US2.1]
test(epic-5): add unit tests for authController [US5.1]
docs: update README with Docker instructions [US1.5]
```

---

## 📚 Références

- **USER_STORIES.md** : Détails complets des 26 user stories
- **PROGRESS.md** : Tableau de bord d'avancement et roadmap
- **PROJECT_PLAN.md** : Vue d'ensemble du projet et des epics
- **.github/copilot-instructions.md** : Instructions pour GitHub Copilot

---

**Dernière mise à jour** : 24 octobre 2025
