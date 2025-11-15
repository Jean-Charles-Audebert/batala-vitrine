# Audit CSS - Séparation des responsabilités

## Résumé exécutif

**Problèmes identifiés** :
- Plus de 100 occurrences de style inline dans les templates
- Duplication de patterns CSS (flexbox, gaps, colors)
- Manque de composants CSS réutilisables
- Styles admin mélangés avec styles publics dans certains cas

## Catégorisation du CSS inline

### ✅ **JUSTIFIÉ** (à conserver)
**Styles dynamiques depuis la BDD** :
- `contentBlock.bg_color`, `title_color`, `description_color` → couleurs personnalisées
- `contentBlock.title_font` → polices custom
- `pageSettings.header_bg_image`, `footer_bg_color` → thèmes utilisateur
- `card.title_color`, `card.description_bg_color` → styles par carte

**Exemples** :
```ejs
<!-- OK: Couleur de fond dynamique depuis BDD -->
<div style="background-color: <%= contentBlock.bg_color %>">
<!-- OK: Police personnalisée -->
<h2 style="font-family: <%= contentBlock.title_font %>">
```

### ❌ **À REFACTORISER** (créer des classes)

#### 1. **Layout patterns répétitifs**
**Problème** : Flexbox inline répété 20+ fois
```ejs
<div style="display: flex; gap: 0.5rem; align-items: center;">
<div style="display: flex; gap: 1rem; align-items: center;">
```

**Solution** : Classes utilitaires
```css
.flex-row { display: flex; }
.flex-center { align-items: center; }
.flex-between { justify-content: space-between; }
.gap-sm { gap: 0.5rem; }
.gap-md { gap: 1rem; }
```

#### 2. **Image previews**
**Problème** : Styles répétés pour aperçus
```ejs
<img style="max-width: 300px; border: 1px solid #ddd; border-radius: 4px;">
<img style="max-width: 150px; border: 1px solid #ddd; border-radius: 4px; padding: 0.5rem;">
```

**Solution** : Classes de composant
```css
.preview-img { max-width: 300px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
.preview-img-logo { max-width: 150px; padding: 0.5rem; }
```

#### 3. **Color pickers**
**Problème** : Duplication dans color-picker.ejs
```ejs
<input type="color" style="width: 60px; height: 40px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
<input type="text" style="flex: 1; background: #f5f5f5; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px; font-family: monospace;">
```

**Solution** : Classes dans color-picker
```css
.color-input { width: 60px; height: 40px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; }
.color-hex-input { flex: 1; background: var(--bg-secondary); font-family: monospace; }
```

#### 4. **Alert boxes / Info panels**
**Problème** : Styles inline pour alertes
```ejs
<div style="background: #e3f2fd; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid #1976d2;">
<p style="padding: 1rem; background: #e8f5e9; border-left: 4px solid #4CAF50; border-radius: 4px;">
```

**Solution** : Classes sémantiques
```css
.alert-box { padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; border-left: 4px solid; }
.alert-info { background: #e3f2fd; border-color: #1976d2; }
.alert-success { background: #e8f5e9; border-color: #4CAF50; }
.alert-warning { background: #fff3e0; border-color: #f57c00; }
```

#### 5. **Section headers admin**
**Problème** : Headers répétés dans forms
```ejs
<h2 style="margin-bottom: 2rem; color: #333; font-size: 1.5rem;">🎨 Thème de la page</h2>
<h3 style="margin: 2rem 0 1rem 0; padding: 0.75rem; background: #f5f5f5; border-left: 4px solid #2196F3; color: #333; font-size: 1.25rem;">
```

**Solution** : Classes de titre admin
```css
.admin-section-title { margin-bottom: 2rem; color: var(--text-primary); font-size: 1.5rem; }
.admin-subsection-title { margin: 2rem 0 1rem; padding: 0.75rem; background: var(--bg-secondary); border-left: 4px solid var(--color-primary); }
```

#### 6. **Badges / Tags**
**Problème** : Badges inline dans fonts.ejs
```ejs
<span style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">SYSTÈME</span>
<span style="background: #fff3e0; color: #f57c00; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">GOOGLE</span>
```

**Solution** : Classes de badge
```css
.badge { padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
.badge-primary { background: #e3f2fd; color: #1976d2; }
.badge-warning { background: #fff3e0; color: #f57c00; }
.badge-purple { background: #f3e5f5; color: #7b1fa2; }
```

#### 7. **Display utilities**
**Problème** : display: none inline partout
```ejs
<div style="display: none;">
<button style="display: inline;">
```

**Solution** : Classes utilitaires
```css
.d-none { display: none !important; }
.d-inline { display: inline !important; }
.d-block { display: block !important; }
```

## Plan de refactorisation

### Phase 1 : Créer classes utilitaires dans common.css ✅ PARTIELLEMENT FAIT
- [x] Variables CSS (déjà fait)
- [ ] Flexbox utilities (`.flex-row`, `.flex-center`, etc.)
- [ ] Spacing utilities étendues
- [ ] Display utilities

### Phase 2 : Créer composants admin dans admin.css
- [ ] `.admin-section-title`, `.admin-subsection-title`
- [ ] `.alert-box` et variantes
- [ ] `.badge` et variantes
- [ ] `.color-picker-container`, `.color-input`, `.color-hex-input`
- [ ] `.preview-img` et variantes

### Phase 3 : Refactoriser templates par priorité
1. **block-form.ejs** (80+ styles inline)
2. **fonts.ejs** / **font-form.ejs** (40+ styles inline)
3. **color-picker.ejs** (composant réutilisable)
4. **card-form.ejs** (preview images)
5. **media-gallery.ejs** / **content-section.ejs** (garder styles dynamiques uniquement)

### Phase 4 : Auditer index.css pour dédoublons
- Vérifier si certains styles inline sont déjà définis
- Consolider les styles de cards
- Supprimer styles inutilisés

## Règles à respecter

### ✅ **Garder inline**
1. Valeurs dynamiques depuis BDD (couleurs, polices, images)
2. Styles calculés en JavaScript côté client
3. Styles critiques pour FOUC (Flash Of Unstyled Content)

### ❌ **Ne jamais inline**
1. Layout structures (flexbox, grid, positioning)
2. Couleurs/tailles fixes hardcodées
3. States (hover, focus, active)
4. Responsive breakpoints
5. Animations/transitions

## Métriques

**Avant refactorisation** :
- 100+ occurrences `style=` dans templates
- 6 fichiers CSS fragmentés
- Duplication estimée : 40%

**Objectif après refactorisation** :
- <30 occurrences `style=` (uniquement dynamique)
- Classes utilitaires consolidées dans common.css
- Composants admin dans admin.css
- Réduction duplication : <10%

## Prochaines étapes

1. Créer les classes utilitaires manquantes
2. Créer les composants admin
3. Refactoriser block-form.ejs (plus gros fichier)
4. Documenter les nouveaux composants dans README.md CSS
