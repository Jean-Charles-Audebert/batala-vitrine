# Système de Schémas pour l'Édition de Sections

Ce document décrit le système de schémas JSON qui permet de générer dynamiquement des formulaires d'édition pour les sections du site.

## Architecture

### Fichiers clés

- **`config/schemas.json`** : Définitions des schémas pour chaque type de section
- **`public/js/editor/FormGenerator.js`** : Générateur de formulaires dynamiques
- **`public/js/components/MediaSelector.js`** : Composant réutilisable pour sélection de médias
- **`public/css/editor.css`** : Styles pour les composants de formulaire

### Base de données

Les configurations de section sont stockées dans le champ JSONB `settings` de la table `sections` :

```sql
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  page_id INT REFERENCES page(id),
  type VARCHAR(50) CHECK(type IN ('hero', 'standard', 'footer')),
  position INT,
  is_visible BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Structure des Schémas

### Héritage avec `_common`

Le schéma `_common` définit les paramètres partagés par tous les types de sections :

```json
{
  "_common": {
    "fields": {
      "background": {
        "type": "group",
        "label": "Arrière-plan",
        "fields": {
          "bg_type": { "type": "media-selector" },
          "bg_color": { "type": "color", "showIf": {"field": "bg_type", "value": "color"} },
          "bg_media": { "type": "media", "showIf": {"field": "bg_type", "value": "media"} },
          "bg_youtube": { "type": "url", "showIf": {"field": "bg_type", "value": "youtube"} },
          "bg_opacity": { "type": "range", "min": 0, "max": 1, "step": 0.1 }
        }
      }
    }
  }
}
```

Les schémas spécifiques héritent de `_common` avec `"extends": "_common"` :

```json
{
  "hero": {
    "extends": "_common",
    "fields": {
      "logo": {
        "type": "group",
        "label": "Logo",
        "fields": {
          "logo_visible": { "type": "checkbox" },
          "logo_position": { "type": "select" },
          "logo_size": { "type": "select" }
        }
      }
    }
  }
}
```

## Types de Champs Supportés

### Types de base

| Type | Description | Exemple |
|------|-------------|---------|
| `text` | Champ texte simple | Titre, texte court |
| `textarea` | Zone de texte multiligne | Description, contenu long |
| `number` | Nombre avec min/max/step | Taille, position |
| `checkbox` / `boolean` | Case à cocher | Visibilité, activation |
| `select` | Menu déroulant | Position (left/center/right), taille (sm/md/lg) |
| `color` | Sélecteur de couleur | Couleur de fond, couleur de texte |
| `url` | URL avec validation | YouTube URL |

### Types avancés

#### `font-select` / `font`

Sélecteur de police à partir des polices du site :

```json
{
  "title_font_id": {
    "type": "font-select",
    "label": "Police du titre",
    "default": ""
  }
}
```

#### `media`

Bouton de sélection d'un fichier média uploadé :

```json
{
  "logo_media": {
    "type": "media",
    "label": "Fichier logo",
    "accept": "image/*"
  }
}
```

#### `media-selector`

Composant complet avec radio buttons pour choisir entre Aucun / Image-Vidéo / YouTube :

```json
{
  "bg_type": {
    "type": "media-selector",
    "label": "Type d'arrière-plan",
    "default": "none"
  }
}
```

Génère :
- Radio buttons : Aucun, Image/Vidéo, YouTube
- Input média (masqué sauf si "Image/Vidéo" sélectionné)
- Input YouTube URL (masqué sauf si "YouTube" sélectionné)

#### `range`

Slider avec affichage de la valeur courante :

```json
{
  "bg_opacity": {
    "type": "range",
    "label": "Opacité de l'arrière-plan",
    "min": 0,
    "max": 1,
    "step": 0.1,
    "default": 0.5
  }
}
```

### Logique Conditionnelle : `showIf`

Permet d'afficher/masquer des champs selon la valeur d'un autre champ :

```json
{
  "bg_type": {
    "type": "media-selector",
    "label": "Type d'arrière-plan"
  },
  "bg_color": {
    "type": "color",
    "label": "Couleur de fond",
    "showIf": {
      "field": "bg_type",
      "value": "color"
    }
  }
}
```

Le champ `bg_color` n'est visible que si `bg_type === "color"`.

## Groupes de Champs

Les champs peuvent être regroupés visuellement :

```json
{
  "logo": {
    "type": "group",
    "label": "Configuration du logo",
    "fields": {
      "logo_visible": { "type": "checkbox", "label": "Afficher le logo" },
      "logo_position": { "type": "select", "label": "Position" },
      "logo_size": { "type": "select", "label": "Taille" }
    }
  }
}
```

Génère une section `<h4>Configuration du logo</h4>` avec les champs groupés.

## Workflow d'Édition

### 1. Ouverture du Modal

```javascript
// Dans SectionManager
showSectionModal(sectionId, sectionType) {
  // Charger les données de section.settings si édition
  this.loadSectionData(sectionId);
}
```

### 2. Génération du Formulaire

```javascript
// Dans FormGenerator
generateSectionForm(sectionType, sectionData = {}) {
  // 1. Résoudre l'héritage (_common extends)
  const schema = this.resolveSchema(sectionType);
  
  // 2. Générer les groupes de champs
  Object.keys(schema.fields).forEach(groupKey => {
    const groupElement = this.createFormGroup(groupKey, group, sectionData[groupKey]);
    dynamicForm.appendChild(groupElement);
  });
  
  // 3. Attacher la logique conditionnelle
  this.attachConditionalLogic();
}
```

### 3. Collecte des Données

```javascript
// Dans FormGenerator
collectFormData() {
  // 1. Récupérer tous les inputs classiques
  const formData = {};
  fields.forEach(field => {
    formData[field.name] = field.value;
  });
  
  // 2. Récupérer les valeurs des MediaSelectors
  this.mediaSelectors.forEach((selector, fieldKey) => {
    const values = selector.getValues(); // {type, image, youtube}
    formData[fieldKey] = values.type;
    formData[`${fieldKey}_media`] = values.image;
    formData[`${fieldKey}_youtube`] = values.youtube;
  });
  
  return formData;
}
```

### 4. Sauvegarde

```javascript
// Dans SectionManager
async saveSection() {
  const formData = window.formGenerator.collectFormData();
  const sectionData = {
    type: sectionType,
    settings: formData, // Stocké en JSONB
    is_visible: true
  };
  
  await fetch('/api/sections', {
    method: 'POST',
    body: JSON.stringify(sectionData)
  });
}
```

## Utilisation dans les Templates

Les templates de section (`hero.ejs`, `standard.ejs`, `footer.ejs`) lisent `section.settings` pour appliquer les styles :

```ejs
<section class="hero-section" 
  style="
    <% if (section.settings?.background?.bg_type === 'color') { %>
      background-color: <%= section.settings.background.bg_color %>;
    <% } %>
    <% if (section.settings?.transparency?.is_transparent) { %>
      background: transparent;
    <% } %>
  ">
  
  <% if (section.settings?.logo?.logo_visible) { %>
    <img src="..." class="logo <%= section.settings.logo.logo_position %> <%= section.settings.logo.logo_size %>">
  <% } %>
</section>
```

## Extension du Système

### Ajouter un nouveau type de champ

1. **Ajouter le case dans `createFormField()`** :

```javascript
case 'mon-nouveau-type':
  input = this.createMonNouveauTypeField(fieldKey, fieldSchema, fieldValue);
  fieldDiv.appendChild(input);
  return fieldDiv;
```

2. **Créer la méthode de création** :

```javascript
createMonNouveauTypeField(fieldKey, fieldSchema, fieldValue) {
  const container = document.createElement('div');
  // ... créer le composant
  return container;
}
```

3. **Ajouter la logique de collecte dans `collectFormData()`** si nécessaire.

### Ajouter un nouveau type de section

1. **Ajouter le type dans la table** :

```sql
ALTER TABLE sections DROP CONSTRAINT sections_type_check;
ALTER TABLE sections ADD CONSTRAINT sections_type_check 
  CHECK(type IN ('hero', 'standard', 'footer', 'nouveau-type'));
```

2. **Définir le schéma dans `config/schemas.json`** :

```json
{
  "nouveau-type": {
    "extends": "_common",
    "fields": {
      "specific_group": {
        "type": "group",
        "label": "Paramètres spécifiques",
        "fields": {
          "specific_param": { "type": "text" }
        }
      }
    }
  }
}
```

3. **Créer le template `src/views/components/sections/nouveau-type.ejs`**.

4. **Ajouter l'inclusion dans `index-v2.ejs`** :

```ejs
<% if (section.type === 'nouveau-type') { %>
  <%- include('../components/sections/nouveau-type', { section }) %>
<% } %>
```

## Notes de Développement

- **Normalisation des types** : `checkbox` → `boolean`, `font-select` → `font` dans `createFormField()` pour compatibilité ascendante
- **MediaSelector tracking** : Les instances sont stockées dans `this.mediaSelectors` (Map) et cleared à chaque génération de formulaire
- **Conditional logic** : La méthode `attachConditionalLogic()` est appelée après génération complète du formulaire
- **Schema resolution** : L'héritage est résolu une seule fois au début de `generateSectionForm()` via `resolveSchema()`

## Exemples de Schémas Complets

Voir `config/schemas.json` pour les définitions complètes de :
- **_common** : Paramètres partagés (background, transparency, title)
- **hero** : Logo, titre hero, navigation, liens sociaux avec positionnement
- **standard** : Sections de contenu génériques
- **footer** : Couleurs de contenu footer

---

**Dernière mise à jour** : Janvier 2025  
**Auteur** : caixaDev - https://caixadev.dev
