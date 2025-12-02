# Audit CSS - Analyse et Plan de Refactoring

## 📊 État des lieux

### Fichiers CSS actuels (par taille)
| Fichier | Lignes | Rôle actuel | Problèmes identifiés |
|---------|--------|-------------|---------------------|
| `public/css/pages/editor.css` | 740 | Styles page éditeur | Duplication avec editor.css |
| `public/css/page.css` | 687 | Styles page publique | Règles conflictuelles (background) |
| `public/css/editor.css` | 660 | Styles éditeur | **99.96% identique à editor/editor.css** |
| `public/css/editor/editor.css` | 462 | Styles éditeur (dupliqué) | **Doublon quasi-identique** |
| `public/css/index.css` | 418 | Reset + Grid + Utilities | Bon (utilitaires généraux) |
| `public/css/editor/sections.css` | 289 | Styles sections éditeur | Rôle clair |
| `public/css/login.css` | 103 | Page login | Rôle clair, isolé |
| `public/css/buttons.css` | 98 | Composants boutons | Rôle clair |
| `public/css/pages/index-v2.css` | 10 | Override page publique | Quasi-vide, inutile ? |

---

## 🚨 Problèmes critiques identifiés

### 1. **DUPLICATION MASSIVE**
- ❌ `editor.css` (660 lignes) et `editor/editor.css` (462 lignes) sont **99.96% identiques**
- ❌ `pages/editor.css` (740 lignes) contient probablement aussi des duplications
- **Impact** : Maintenance double, risque d'incohérences, poids CSS inutile

### 2. **45 règles `!important`**
Répartition :
- **25x** dans `index.css` (utilities responsive - justifié)
- **8x** dans `page.css` (background conflicts, video/youtube positioning - **problématique**)
- **5x** dans `buttons.css` (spinner icon sizing - **à revoir**)
- **7x** dans fichiers editor (focus states, drag & drop - acceptable)

**Problèmes spécifiques :**
- `body.vitrine-page { background: none !important; }` ❌ **SUPPRIMÉ** (empêchait bg_color)
- `.main-content-wrapper { background: none !important; }` ❌ **SUPPRIMÉ** (idem)
- Video backgrounds avec `position: fixed !important` ⚠️ (peut-être nécessaire pour z-index)

### 3. **CSS Inline massif (46 occurrences)**
**Sections templates :**
- `hero.ejs` : 4 styles inline (bgStyle, nav colors, title color/size)
- `standard.ejs` : 2 styles inline (section bg, title color/size)
- `footer.ejs` : 5 styles inline (bg, nav colors, text colors)

**Pages éditeur :**
- `editor.ejs` : 18 styles inline (form hints, visibility toggles, spacing)
- `fonts.ejs` : 7 styles inline (margins, padding, layout)
- `admins.ejs` : 1 style inline (form display)

**Exemples problématiques :**
```ejs
<!-- hero.ejs -->
<nav style="background-color: <%= nav_bg_color %>; color: <%= nav_text_color %>;">
<h1 style="color: <%= titleColor %>; font-size: <%= titleSize %>px;">

<!-- footer.ejs -->
<div class="container" style="color: <%= content_text_color %>;">
```

**Impact :** 
- ❌ Impossible de modifier via CSS
- ❌ Duplication logique couleurs/tailles
- ❌ Pas de hover/responsive possible

---

## 🎯 Architecture CSS cible

### Structure proposée
```
public/css/
├── core/
│   ├── variables.css          # Toutes les CSS custom properties
│   ├── reset.css              # Normalize + base styles
│   └── utilities.css          # Classes utilitaires (hidden, flex, grid, etc.)
├── layout/
│   ├── grid.css               # Système grille 12 colonnes
│   └── containers.css         # Wrappers, sections, spacing
├── components/
│   ├── buttons.css            # Tous les boutons
│   ├── forms.css              # Inputs, selects, labels
│   ├── cards.css              # Cartes, conteneurs
│   ├── nav.css                # Navigations (hero, footer)
│   └── modals.css             # Modales, overlays
├── sections/
│   ├── hero.css               # Styles section hero
│   ├── standard.css           # Sections standards
│   ├── footer.css             # Section footer
│   └── backgrounds.css        # Video/YouTube/Image backgrounds
├── pages/
│   ├── public.css             # Page publique (index-v2)
│   ├── editor.css             # Interface éditeur
│   └── login.css              # Page login (garder séparé)
└── vendor/
    └── fontawesome.css        # External deps si nécessaire
```

### Ordre de chargement
```html
<!-- Page publique -->
<link rel="stylesheet" href="/css/core/variables.css">
<link rel="stylesheet" href="/css/core/reset.css">
<link rel="stylesheet" href="/css/layout/grid.css">
<link rel="stylesheet" href="/css/components/buttons.css">
<link rel="stylesheet" href="/css/components/nav.css">
<link rel="stylesheet" href="/css/sections/backgrounds.css">
<link rel="stylesheet" href="/css/sections/hero.css">
<link rel="stylesheet" href="/css/sections/standard.css">
<link rel="stylesheet" href="/css/sections/footer.css">
<link rel="stylesheet" href="/css/pages/public.css">

<!-- Éditeur -->
+ <link rel="stylesheet" href="/css/components/forms.css">
+ <link rel="stylesheet" href="/css/components/modals.css">
+ <link rel="stylesheet" href="/css/pages/editor.css">
```

---

## 📋 Plan de refactoring

### Phase 1 : Supprimer duplications (URGENT)
- [ ] **1.1** Supprimer `public/css/editor/editor.css` (doublon de editor.css)
- [ ] **1.2** Comparer `editor.css` vs `pages/editor.css`, merger intelligemment
- [ ] **1.3** Supprimer ou clarifier `pages/index-v2.css` (10 lignes, quasi-vide)
- [ ] **1.4** Vérifier que les templates ne chargent pas les doublons

### Phase 2 : Extraire CSS inline vers classes
- [ ] **2.1** Créer classes utilitaires pour couleurs dynamiques
  ```css
  /* sections/hero.css */
  .hero-nav { background-color: var(--hero-nav-bg); color: var(--hero-nav-text); }
  .hero-title { color: var(--hero-title-color); font-size: var(--hero-title-size); }
  ```
- [ ] **2.2** Injecter CSS variables dans `<style>` du `<head>` au lieu d'inline
  ```ejs
  <style>
    :root {
      --hero-nav-bg: <%= nav_bg_color %>;
      --hero-nav-text: <%= nav_text_color %>;
      --hero-title-color: <%= titleColor %>;
      --hero-title-size: <%= titleSize %>px;
    }
  </style>
  ```
- [ ] **2.3** Remplacer tous les `style=` dans templates par classes + CSS vars
- [ ] **2.4** Créer classes utilitaires pour visibilité conditionnelle
  ```css
  .is-hidden { display: none; }
  .bg-media-field { display: none; }
  .bg-media-field.is-visible { display: block; }
  ```

### Phase 3 : Nettoyer !important
- [ ] **3.1** Revoir `page.css` video backgrounds (tester sans !important)
- [ ] **3.2** Buttons.css spinner : utiliser classes spécifiques au lieu de !important
- [ ] **3.3** Documenter les !important restants (utilities responsive justifiés)

### Phase 4 : Réorganiser l'architecture
- [ ] **4.1** Créer structure `core/`, `layout/`, `components/`, `sections/`, `pages/`
- [ ] **4.2** Extraire variables CSS dans `core/variables.css`
- [ ] **4.3** Extraire reset/normalize dans `core/reset.css`
- [ ] **4.4** Extraire utilitaires dans `core/utilities.css`
- [ ] **4.5** Splitter `page.css` (687 lignes) en modules thématiques
- [ ] **4.6** Splitter `editor.css` en composants réutilisables
- [ ] **4.7** Mettre à jour tous les templates avec nouveaux paths

### Phase 5 : Documentation
- [ ] **5.1** Créer `public/css/README.md` avec architecture complète
- [ ] **5.2** Documenter chaque fichier avec header commenté (rôle, dépendances)
- [ ] **5.3** Créer guide de contribution CSS (naming conventions, no inline, etc.)

### Phase 6 : Validation
- [ ] **6.1** Tester page publique (toutes sections)
- [ ] **6.2** Tester éditeur (sidebar, modales, drag & drop)
- [ ] **6.3** Tester responsive (mobile, tablet, desktop)
- [ ] **6.4** Lighthouse audit (performance CSS)

---

## 🔧 Actions immédiates (Quick Wins)

### ✅ Déjà fait
- [x] Supprimé `body.vitrine-page { background: none !important; }`
- [x] Supprimé `.main-content-wrapper { background: none !important; }`

### 🚀 À faire maintenant (5 min chacun)
1. **Supprimer doublon editor/editor.css**
   ```powershell
   Remove-Item public/css/editor/editor.css
   # Vérifier que editor.ejs charge bien public/css/editor.css
   ```

2. **Supprimer pages/index-v2.css (inutile)**
   ```powershell
   Remove-Item public/css/pages/index-v2.css
   # Supprimer <link> dans src/views/pages/index-v2.ejs
   ```

3. **Renommer editor.css en pages/editor-main.css (clarté)**
   ```powershell
   Move-Item public/css/editor.css public/css/pages/editor-main.css
   # Mettre à jour src/views/pages/editor.ejs
   ```

---

## 📐 Conventions CSS (à appliquer)

### Naming
- **BEM** pour composants : `.block__element--modifier`
- **Kebab-case** : `.hero-nav`, `.section-title`
- **Préfixes utilitaires** : `.u-hidden`, `.u-text-center`
- **Préfixes responsive** : `.sm:hidden`, `.md:flex`

### Organisation fichier
```css
/* ==================================================
   NOM DU FICHIER - Description
   Dépendances: variables.css, reset.css
   ================================================== */

/* === SECTION 1 === */
.selector {
  /* Propriété */
}

/* === SECTION 2 === */
```

### Interdictions
- ❌ **Jamais de `style=` inline** (sauf cas exceptionnel documenté)
- ❌ **Pas de `!important`** sauf utilitaires ou override externe
- ❌ **Pas de couleurs hardcodées** → utiliser CSS variables
- ❌ **Pas de z-index aléatoires** → échelle définie (1-10, 100-110, 1000-1010)

---

## 📊 Métriques cibles

### Avant refactoring
- **Total lignes CSS** : ~3467 lignes
- **Fichiers** : 9 fichiers
- **Duplication** : 99.96% entre 2 fichiers
- **!important** : 45 occurrences
- **Inline styles** : 46 occurrences

### Après refactoring (objectifs)
- **Total lignes CSS** : ~2500 lignes (-28%)
- **Fichiers** : 15 fichiers (mieux organisés)
- **Duplication** : 0%
- **!important** : <20 occurrences (utilities uniquement)
- **Inline styles** : 0 (CSS variables dans `<style>` uniquement)

---

## 🎬 Prochaines étapes

**Pour démarrer le refactoring :**
1. Valider cette architecture avec l'équipe
2. Créer une branche `refactor/css-cleanup`
3. Commencer par Phase 1 (supprimer duplications) - **RAPIDE**
4. Puis Phase 2 (extraire inline) - **IMPACT MAXIMUM**
5. Phase 3-4 progressivement

**Estimation temps :**
- Phase 1 : 30 min
- Phase 2 : 2h
- Phase 3 : 1h
- Phase 4 : 3h
- Phase 5-6 : 1h
- **Total : ~7.5h sur 2-3 jours**

---

*Audit réalisé le 1er décembre 2025*
