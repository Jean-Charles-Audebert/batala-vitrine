# Structure unifiée des settings JSONB

Ce document décrit la structure complète et normalisée des `settings` JSONB pour les sections et éléments.

## Principes

1. **Tous les champs déclarés** : même avec valeurs `null`, pour documentation et éviter `undefined`
2. **Positions séparées** : `align` ('left'|'center'|'right') + `vertical_align` ('top'|'center'|'bottom')
3. **Tailles en px** : nombres entiers uniquement (ex: `20` au lieu de `'20px'`)
4. **Cohérence** : même structure pour tous les types d'éléments similaires

---

## Sections

### Hero Section (`type: 'hero'`)

```javascript
{
  // --- Title group ---
  title: 'Bienvenue',
  title_font: 154,  // ID font
  title_color: '#000',
  title_size: 80,  // px
  show_title: true,
  
  // --- Background group ---
  bg_type: 'media',  // 'color' | 'media' | 'youtube'
  bg_color: '#f0f0f0',
  bg_image: '/assets/header-bg-default.svg',
  bg_video: null,
  bg_youtube: null,
  
  // --- Transparency group ---
  bg_transparent: false,
  
  // --- Layout ---
  layout: '12-cols-grid',
  align: 'center',  // Pour le contenu principal
  vertical_align: 'center',
  
  // --- Logo (position via elements) ---
  logo_align: 'left',
  logo_vertical_align: 'center',
  logo_width: 150,  // px
  
  // --- Hero Title ---
  title_align: 'center',
  title_vertical_align: 'center',
  
  // --- Navigation (position via elements) ---
  nav_align: 'center',
  nav_vertical_align: 'bottom',
  nav_text_color: '#ffffff',
  nav_bg_color: 'rgba(255,255,255,0.25)',
  
  // --- Social Links ---
  social_align: 'right',
  social_vertical_align: 'top',
  social_icon_size: 24,  // px
  social_icon_color: '#ffffff'
}
```

### Standard Section (`type: 'standard'`)

```javascript
{
  // --- Title group ---
  title: 'Présentation',
  title_font: 154,
  title_color: '#333',
  title_size: 32,  // px
  show_title: true,
  
  // --- Background group ---
  bg_type: 'color',
  bg_color: '#fff',
  bg_image: null,
  bg_video: null,
  bg_youtube: null,
  
  // --- Transparency group ---
  bg_transparent: false,
  
  // --- Layout ---
  layout: '12-cols-grid',
  align: 'center'
}
```

### Footer Section (`type: 'footer'`)

```javascript
{
  // --- Background group ---
  bg_type: 'color',
  bg_color: '#333',
  bg_image: null,
  bg_video: null,
  bg_youtube: null,
  
  // --- Transparency group ---
  bg_transparent: false,
  
  // --- Layout ---
  layout: '12-cols-grid',
  
  // --- Footer Content ---
  content_text_color: '#ffffff',
  content_link_color: '#ffffff'
}
```

---

## Éléments (dans `elements` table)

### Media Element (`type: 'media'`)

```javascript
{
  media_url: '/assets/logo-default.svg',
  media_type: 'image',  // 'image' | 'video'
  width: 'auto',  // 'auto' | px number
  height: 80,  // px or null for auto
  align: 'left',  // 'left' | 'center' | 'right'
  vertical_align: 'center',  // 'top' | 'center' | 'bottom'
  alt_text: 'Logo'
}
```

### Text Element (`type: 'text'`)

```javascript
{
  content: 'Lorem ipsum dolor sit amet...',
  font_id: 155,
  size: 20,  // px
  color: '#333',
  bg_color: null,
  align: 'center',
  vertical_align: 'top',
  padding: 0  // px
}
```

### Card Element (`type: 'card'`)

```javascript
{
  media_url: '/assets/icon-consulting.svg',
  media_type: 'image',
  width: 'auto',
  height: 60,  // px
  align: 'center',
  vertical_align: 'top',
  title: {
    text: 'Consulting',
    font_id: 154,
    size: 20,  // px
    color: '#333',
    bg_color: null
  },
  description: {
    text: 'Description du service 1',
    font_id: 155,
    size: 16,  // px
    color: '#666',
    bg_color: null
  }
}
```

### Gallery Element (`type: 'gallery'`)

```javascript
{
  media_url: '/assets/placeholder-1.svg',
  media_type: 'image',
  width: 'auto',
  height: null,
  align: 'center',
  vertical_align: 'center',
  alt_text: 'Image 1'
}
```

### YouTube Element (`type: 'youtube'`)

```javascript
{
  youtube_url: 'https://youtu.be/2WPplCREC1c',
  align: 'center',
  vertical_align: 'center',
  autoplay: false,
  mute: false,
  loop: false
}
```

### Link Element (`type: 'link'`)

```javascript
{
  link_type: 'navigation',  // 'navigation' | 'external'
  label: 'Accueil',
  target_section_id: 1,  // Pour navigation interne
  url: null,  // Pour liens externes
  text_color: '#ffffff',
  bg_color: 'rgba(255,255,255,0.25)',
  align: 'center',
  vertical_align: 'bottom'
}
```

### Contact Element (`type: 'contact'`)

```javascript
{
  title: 'Contactez-nous',
  description: 'Remplissez le formulaire...',
  align: 'center',
  vertical_align: 'center'
}
```

---

## Avantages de cette structure

✅ **Documentation vivante** : le seed montre tous les champs disponibles  
✅ **Pas de `undefined`** : tous les champs existent dès le départ  
✅ **Cohérence** : `align`/`vertical_align` partout, tailles en px partout  
✅ **FormGenerator fiable** : sait exactement quels champs attendre  
✅ **Templates simplifiés** : peuvent lire `s.property` sans fallback complexe  
✅ **Maintenance facile** : structure claire et prévisible

---

## Flux de données

```
FormGenerator.collectFormData()
  → {settings: {...}}
    → PUT /api/sections/:id
      → sectionController.updateSection()
        → UPDATE sections SET settings = $1
          → pageBuilder.loadSectionsWithElements()
            → Templates (hero.ejs, standard.ejs, footer.ejs)
              → const s = section.settings || {}
                → Affichage avec s.bg_color, s.title, etc.
```
