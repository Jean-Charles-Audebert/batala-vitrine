# Architecture : Polices par défaut (Default Fonts)

## 📋 Vue d'ensemble

Les polices par défaut du site sont stockées dans la table `page` et utilisées pour styliser tous les éléments qui n'ont pas de police spécifique définie.

## 🗄️ Base de Données

### Table `fonts`
```sql
CREATE TABLE fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('google', 'upload', 'system')),
    url VARCHAR(1024),
    variants JSONB DEFAULT '[]',
    font_family VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table `page` (colonnes pertinentes)
```sql
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Mon Site',
    default_font_title INT REFERENCES fonts(id) ON DELETE SET NULL,
    default_font_text INT REFERENCES fonts(id) ON DELETE SET NULL,
    contact_email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colonnes essentielles :**
- `default_font_title` : ID de la police pour tous les titres (sans police spécifique)
- `default_font_text` : ID de la police pour tous les textes (sans police spécifique)

## 🔄 Flux de circulation des données

### 1️⃣ Initialisation (Démarrage de l'éditeur)

```
BDD (page) → loadPageData() → buildEditorData() → pageData JSON → Sidebar EJS → HTML select
     ↓
  default_font_title=2
  default_font_text=1
```

**Détail du flux :**

**a) Chargement BDD** (`pageController.js` → `getPage()`)
```javascript
SELECT * FROM page LIMIT 1
// Retourne: { ..., default_font_title: 2, default_font_text: 1, ... }
```

**b) Service** (`pageBuilder.js` → `buildEditorData()`)
```javascript
const pageData = loadPageData();
// Retourne:
// {
//   id: 1,
//   default_font_title: 2,
//   default_font_text: 1,
//   ...
// }

return { page: pageData, sections, fonts, ... }
```

**c) Rendu du sidebar** (`unified-sidebar-v2.ejs`)
```ejs
<select id="page-title-font-id">
  <option value="">— Par défaut —</option>
  <% pageData.fonts.forEach(font => { %>
    <option value="<%= font.id %>" 
      <%= (pageData.page.default_font_title == font.id) ? 'selected' : '' %>>
      <%= font.name %>
    </option>
  <% }); %>
</select>
```

**d) Initialisation JS** (`EditorApp.js` → `constructor()`)
```javascript
this.page = window.pageData.page; // Contient: default_font_title=2, default_font_text=1
this.fonts = window.pageData.fonts;
```

**e) Refresh des sélecteurs** (`EditorApp.js` → `refreshFontSelects()`)
```javascript
// IMPORTANT: Utiliser this.page.default_font_title (pas currentValue!)
if (font.id == this.page.default_font_title) {
  option.selected = true;
}
```

### 2️⃣ Modification en temps réel (Utilisateur change une police)

```
HTML select change → updatePreview() → Aperçu se rafraîchit immédiatement
                                           ↓
                              /api/preview (GET) → buildEditorData()
                                           ↓
                              index-v2.ejs rendu avec polices du serveur
```

**Détail du flux :**

**a) Changement d'état du select**
```javascript
// Dans EditorApp.bindPageSettingsEvents() :
// Les selects page-title-font-id et page-text-font-id ont 'change' listener
element.addEventListener('change', () => this.updatePreview());
```

**b) updatePreview() rafraîchit l'aperçu**
```javascript
updatePreview() {
  const settings = {
    titleFontId: titleFontSelect.value,  // ID de la police (string du select)
    textFontId: textFontSelect.value,
    // ... autres paramètres
  };
  this.previewManager.updatePreviewSettings(settings);
}
```

**c) PreviewManager.updatePreviewSettings() recharge l'iframe**
```javascript
// Stratégie : recharger l'iframe pour obtenir les données fraîches du serveur
// au lieu d'injecter du CSS (qui peut être mal synchronisé)
if (settings.titleFontId !== undefined || settings.textFontId !== undefined) {
  this.refresh();  // Recharge l'iframe
  return;
}
```

**d) L'iframe recharge via GET /api/preview**
- Appelle `buildEditorData()` qui récupère les données ACTUELLES de la BDD
- Rend `index-v2.ejs` avec les polices sauvegardées
- L'aperçu affiche immédiatement la nouvelle police

### 3️⃣ Sauvegarde (Utilisateur clique Save)

```
updatePreview() déclenche auto-save après 1000ms → savePageSettings()
                                                       ↓
                                           PUT /api/page avec data
                                                       ↓
                                    pageController.updatePage()
                                                       ↓
                                    UPDATE page table + settings JSONB
                                                       ↓
                                    Aperçu se recharge (refresh)
```

### 4️⃣ Affichage public (Page `/`)

```
showHome() → buildPageData() + loadFonts() → index-v2.ejs rendu
                 ↓
     Récupère page.default_font_title de la BDD
                 ↓
    Cherche la police correspondante dans fonts array
                 ↓
    Applique via CSS variables :root --default-font-title
                 ↓
    Les classes utilisent: font-family: var(--default-font-title)
```

**Détail du flux :**

**a) Chargement des données**
```javascript
export const showHome = async (req, res) => {
  const pageData = await buildPageData();
  const fonts = await loadFonts();
  // ...
  res.render('pages/index-v2', { ...pageData, fonts, ... });
}
```

**b) Recherche des polices** (dans `index-v2.ejs`)
```ejs
<%
  const titleFont = (page.default_font_title && fonts)
    ? fonts.find(f => f.id == page.default_font_title)
    : null;
%>
```

**c) Chargement de la police (si Google Fonts)**
```ejs
<% if (titleFont && titleFont.url) { %>
  <link rel="stylesheet" href="<%= titleFont.url %>">
<% } %>
```

**d) Application via CSS variables**
```ejs
<style>
  :root {
    --default-font-title: '<%= titleFont?.font_family || 'Arial' %>', sans-serif;
    --default-font-text: '<%= textFont?.font_family || 'sans-serif' %>', sans-serif;
  }
</style>
```

**e) Utilisation dans le CSS**
```css
/* page.css */
.font-title-default {
  font-family: var(--default-font-title, Arial, sans-serif);
}
```

## ✅ Checklist d'intégrité

- [ ] **BDD** : `default_font_title` et `default_font_text` dans la table `page`
- [ ] **Service** : `loadPageData()` retourne `default_font_title` et `default_font_text`
- [ ] **Sidebar EJS** : Compare `pageData.page.default_font_title` avec `font.id` pour `selected`
- [ ] **Front-end** : `savePageSettings()` envoie `default_font_title` (pas `title_font_id`)
- [ ] **API** : `updatePage()` accepte `default_font_title` dans `columnFields`
- [ ] **Refresh** : `refreshFontSelects()` utilise `this.page.default_font_title` (pas `currentValue`)
- [ ] **Public** : `index-v2.ejs` applique les polices via CSS variables

## 🐛 Bugs historiques (résolus v2)

1. **`injectFontsIntoIframe()` écrasait le CSS de la page**
   - ✅ FIXÉ : Au lieu d'injecter du CSS sur les classes, on recharge l'iframe quand les polices changent

2. **`fontsData` n'était pas synchronisée après upload/suppression de police**
   - ✅ FIXÉ : `refreshFontSelects()` met à jour `window.fontsData` ET `previewManager.fontsData`

3. **Duplication de noms** : Service retournait à la fois `default_font_title` ET `title_font_id`
   - ✅ FIXÉ : Supprimé les champs dupliqués dans `pageBuilder.js`

4. **Refresh détermine mal la valeur** : `refreshFontSelects()` utilisait `currentValue` qui devenait "" après `innerHTML = ''`
   - ✅ FIXÉ : Utilise maintenant `this.page.default_font_title` directement

5. **Noms incohérents** : Client envoyait `title_font_id` mais serveur attendait `default_font_title`
   - ✅ FIXÉ : Client envoie maintenant `default_font_title`

## 🔧 Maintenance

### Pour ajouter une nouvelle colonne de police (ex: `default_font_subtitle`)

1. **BDD** : `ALTER TABLE page ADD COLUMN default_font_subtitle INT REFERENCES fonts(id);`
2. **Service** : Ajouter dans `loadPageData()` : `default_font_subtitle: page.default_font_subtitle || null,`
3. **Sidebar** : Dupliquer le select pour les sous-titres
4. **Controller** : Ajouter dans `columnFields` de `updatePage()`
5. **Front-end** : Ajouter dans `savePageSettings()` collection des données
6. **Refresh** : Ajouter une section dans `refreshFontSelects()`
7. **Public** : Ajouter CSS variable et application dans `index-v2.ejs`

### Test complet

```bash
npm test               # Tous les tests doivent passer
npm run dev          # Démarrer en dev
# Dans l'éditeur: Changer une police → Recharger la page → Vérifier que la police persiste
```

