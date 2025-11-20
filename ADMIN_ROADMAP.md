# 🗺️ Feuille de Route - Administration du Site Batala Vitrine

**Date :** 20 novembre 2025  
**Version :** 2.0 (Sections System)  
**Statut :** En développement actif  

## 📋 Vue d'ensemble

Cette roadmap détaille les fonctionnalités d'administration restantes pour finaliser l'interface de gestion du site Batala Vitrine. L'objectif est de permettre aux administrateurs de créer et personnaliser complètement leur site web sans intervention technique.

### 🎯 Objectifs principaux

1. **Interface de gestion des sections** - CRUD complet des sections du site
2. **Gestion des cartes** - Ajout et personnalisation de contenu dans les sections
3. **Personnalisation avancée** - Thèmes, polices, médias pour chaque élément
4. **Footer dynamique** - Footer entièrement personnalisable avec copyright protégé

### 🔧 Architecture technique actuelle

- **Backend** : Express.js + PostgreSQL + EJS
- **Frontend admin** : Vanilla JS + EJS templates
- **Système de sections** : Implémenté (hero, content, card_grid, gallery, footer)
- **Gestion des médias** : Upload images/vidéos (50MB max)
- **Polices** : Google Fonts + upload personnalisé

---

## 🚀 Fonctionnalités à développer

### 1. 📝 Gestion des sections

#### 1.1 Interface de création/modification de sections

**Description :** Interface complète pour créer et modifier les sections du site.

**Pages à créer/modifier :**
- `/sections` - Liste des sections avec aperçu
- `/sections/new` - Formulaire création nouvelle section
- `/sections/:id/edit` - Formulaire modification section

**Fonctionnalités :**
- ✅ Sélection du type de section (hero, content, card_grid, gallery, footer)
- ✅ Configuration du layout (centered, image_left, image_right, grid_2, grid_3)
- ✅ Gestion de la position (drag & drop pour réorganiser)
- ✅ Visibilité (visible/caché)
- ✅ Padding personnalisé (none, small, medium, large)

**État actuel :** Partiellement implémenté (routes et controllers de base)

#### 1.2 Personnalisation visuelle des sections

**Thèmes par section :**
- 🎨 **Couleurs** : Background color, text color
- 🖼️ **Images** : Background image avec position/cover/contain
- 🎬 **Vidéos** : Background vidéo (autoplay, muted, loop)
- 🔤 **Polices** : Police personnalisée pour titres (override global)
- ✨ **Transparence** : Option transparent (hérite du parent)
- 📐 **Positionnement** : Sticky header, z-index pour overlays

**Contrôles UI :**
- Color picker intégré
- Upload/preview images
- Sélecteur de polices (liste des polices disponibles)
- Toggle pour options booléennes

### 2. 🃏 Gestion des cartes (Cards)

#### 2.1 Interface d'ajout de cartes

**Description :** Permettre d'ajouter des cartes de contenu dans les sections appropriées.

**Types de cartes supportés :**
- **Content cards** : Titre, description, image/vidéo, CTA button
- **Gallery cards** : Images/photos avec légendes
- **Event cards** : Avec date d'événement
- **Social cards** : Liens vers réseaux sociaux

**Fonctionnalités :**
- ✅ Ajout multiple de cartes par section
- ✅ Réordonnancement par drag & drop
- ✅ Types de médias : image, photo, youtube, video
- ✅ Gestion des événements (dates)

#### 2.2 Personnalisation des cartes

**Options de personnalisation :**
- 🎨 **Couleurs** : Background, title, description colors
- 🔤 **Polices** : Override des polices globales/section
- 📏 **Tailles** : Small, medium, large
- 🎯 **Alignement** : Left, center, right
- 🔗 **Liens** : URL externe ou ancre interne
- 📅 **Événements** : Date avec formatage intelligent

### 3. 🎨 Personnalisation avancée

#### 3.1 Gestion des médias

**Upload et optimisation :**
- 📤 **Upload multiple** : Images et vidéos
- 🗜️ **Optimisation** : Redimensionnement automatique
- 📁 **Organisation** : Dossiers par section/type
- 🖼️ **Formats** : JPEG, PNG, WebP, GIF, SVG, MP4, WebM
- 📊 **Limites** : 50MB max, validation types

**Interface médias :**
- Galerie de médias existants
- Drag & drop upload
- Preview avant sélection
- Métadonnées (alt text, dimensions)

#### 3.2 Système de polices

**Gestion avancée :**
- ➕ **Ajout de polices** : Google Fonts + upload
- 🎯 **Application** : Global, par section, par élément
- 👁️ **Preview** : Aperçu en temps réel
- 🔄 **Fallbacks** : Polices de secours automatiques

### 4. 🦶 Footer personnalisable

#### 4.1 Structure du footer

**Éléments conservés :**
- © **Copyright** : Toujours présent, non modifiable

**Éléments personnalisables :**
- 📝 **Textes** : À propos, contact, mentions légales
- 🔗 **Liens externes** : Conditions, politique de confidentialité
- 🌐 **Réseaux sociaux** : Icônes avec liens (Facebook, Instagram, etc.)
- 🎨 **Thème** : Même contrôles que les sections
- 📱 **Responsive** : Adaptable mobile/desktop

#### 4.2 Interface d'administration

**Contrôles footer :**
- ✏️ **Édition inline** : Modification directe des textes
- 🎨 **Personnalisation** : Couleurs, polices, background
- 🔗 **Gestion liens** : Ajout/suppression de liens externes
- 📱 **Preview responsive** : Aperçu mobile/desktop

---

## 📊 Priorisation et planning

### Phase 1 : Interface de base des sections ✅ TERMINÉ (2-3 jours)

**Objectifs :**
- ✅ Interface liste des sections (`/sections`)
- ✅ Formulaire création section (`/sections/new`)
- ✅ Formulaire modification (`/sections/:id/edit`)
- ✅ Gestion position (drag & drop)
- ✅ Sélecteur d'images de base

**Tâches techniques réalisées :**
- ✅ Routes admin et API déjà existantes
- ✅ Interface EJS complète avec modales
- ✅ Drag & drop pour réorganiser les sections
- ✅ API `/api/sections/reorder` pour sauvegarder l'ordre
- ✅ Sélecteur d'images (`/api/media`) pour choisir les backgrounds
- ✅ Styles CSS améliorés et responsive
- ✅ Notifications utilisateur
- ✅ Tests unitaires : 100% passing

**État actuel :** Interface fonctionnelle pour créer/modifier les sections de base avec drag & drop et sélection d'images.

### Phase 2 : Personnalisation des sections ✅ TERMINÉ (3-4 jours)

**Objectifs :**
- ✅ Thèmes par section (couleurs, images, vidéos)
- ✅ Gestion des polices par section
- ✅ Contrôles UI avancés (color picker, media picker)
- ✅ Preview temps réel

**Tâches techniques réalisées :**
- ✅ Migration DB : Nouveaux champs pour polices, couleurs, effets visuels
- ✅ Support vidéo background : Upload et YouTube
- ✅ Sélecteurs de polices : Avec preview pour titre/sous-titre/texte
- ✅ Contrôles de couleurs avancés : Titres, sous-titres, texte, accent
- ✅ Paramètres d'effets : Border radius, ombres, padding
- ✅ Amélioration UX : Notifications, meilleure gestion d'erreurs
- ✅ API étendue : Endpoints pour polices et vidéos
- ✅ Tests : 100% passing (69 tests)

### Phase 3 : Gestion des cartes (2-3 jours)

**Objectifs :**
- ✅ Interface ajout/modification cartes
- ✅ Personnalisation par carte
- ✅ Gestion médias dans cartes
- ✅ Réordonnancement

**Tâches techniques :**
- Interface cards_v2 dans admin
- Controllers pour CRUD cards
- Upload et gestion médias
- Drag & drop pour ordre

### Phase 4 : Footer dynamique (2-3 jours)

**Objectifs :**
- ✅ Footer entièrement personnalisable
- ✅ Copyright protégé
- ✅ Même contrôles que sections
- ✅ Gestion réseaux sociaux

**Tâches techniques :**
- Modifier table sections (type: footer)
- Interface édition footer
- Protection copyright
- Intégration réseaux sociaux

### Phase 5 : Optimisations et finitions (1-2 jours)

**Objectifs :**
- ✅ Responsive design admin
- ✅ Performance (lazy loading, cache)
- ✅ Accessibilité
- ✅ Tests E2E complets

---

## ✅ Critères d'acceptation

### Fonctionnels

- [ ] **Admin peut créer/modifier toutes les sections**
- [ ] **Admin peut ajouter des cartes dans les sections appropriées**
- [ ] **Chaque élément est entièrement personnalisable (couleurs, polices, médias)**
- [ ] **Footer est dynamique avec copyright protégé**
- [ ] **Interface responsive et intuitive**
- [ ] **Preview temps réel des modifications**

### Techniques

- [ ] **Tests unitaires** : 80%+ couverture
- [ ] **Tests E2E** : Scénarios critiques couverts
- [ ] **Performance** : Pages admin < 2s de chargement
- [ ] **Sécurité** : Validation inputs, protection XSS
- [ ] **Accessibilité** : Conformité WCAG 2.1 AA

### Utilisateur

- [ ] **UX intuitive** : Formation non nécessaire
- [ ] **Feedback visuel** : États de chargement, succès/erreurs
- [ ] **Récupération d'erreurs** : Messages clairs et actions correctives
- [ ] **Responsive** : Fonctionne sur mobile/tablette

---

## 🛠️ Détails techniques par fonctionnalité

### API Endpoints à implémenter

```javascript
// Sections
GET    /api/sections              // Liste sections
POST   /api/sections              // Créer section
GET    /api/sections/:id          // Détails section
PUT    /api/sections/:id          // Modifier section
DELETE /api/sections/:id          // Supprimer section
POST   /api/sections/reorder      // Réorganiser

// Cards
GET    /api/sections/:id/cards    // Liste cartes d'une section
POST   /api/sections/:id/cards    // Ajouter carte
PUT    /api/cards/:id             // Modifier carte
DELETE /api/cards/:id             // Supprimer carte
POST   /api/cards/reorder         // Réorganiser cartes

// Médias
POST   /api/upload                // Upload fichier
GET    /api/media                 // Liste médias
DELETE /api/media/:id             // Supprimer média
```

### Schéma DB - Extensions nécessaires

```sql
-- Extensions table sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS custom_css TEXT;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS custom_js TEXT;

-- Extensions table cards_v2
ALTER TABLE cards_v2 ADD COLUMN IF NOT EXISTS custom_css TEXT;
ALTER TABLE cards_v2 ADD COLUMN IF NOT EXISTS font_family VARCHAR(255);
ALTER TABLE cards_v2 ADD COLUMN IF NOT EXISTS text_align VARCHAR(20);

-- Table media_assets (optionnel)
CREATE TABLE IF NOT EXISTS media_assets (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes INT,
    dimensions VARCHAR(50), -- "1920x1080"
    alt_text TEXT,
    section_id INT REFERENCES sections(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Composants UI à créer

- `sections-list.ejs` - Liste avec drag & drop
- `section-editor.ejs` - Éditeur complet section
- `media-picker.ejs` - Sélecteur de médias
- `color-picker.ejs` - Sélecteur de couleurs
- `font-selector.ejs` - Sélecteur de polices
- `cards-manager.ejs` - Gestionnaire de cartes

---

## 📈 Métriques de succès

- **Temps de développement** : 10-15 jours
- **Complexité** : Moyenne (extension système existant)
- **Risques** : Faibles (architecture déjà validée)
- **Tests** : 100% fonctionnalités critiques
- **Performance** : Impact minimal sur frontend public

---

## 🚀 Prochaines étapes immédiates

**Phase 2 terminée !** ✅

**Phase 3 à commencer :**
1. **Gestion complète des cartes** : CRUD complet pour cards_v2 avec drag & drop
2. **Modales de contenu** : Interface pour gérer le contenu des sections (textes, médias, CTA)
3. **Upload de médias** : Implémentation de l'upload direct depuis l'admin
4. **Preview temps réel avancé** : Aperçu des modifications sans rechargement complet
5. **Gestion des décorations** : Interface pour ajouter/modifier les décorations par section

---

*Cette roadmap sera mise à jour au fur et à mesure de l'avancement du développement.*</content>
<parameter name="filePath">c:\Workspaces\Perso\batala-vitrine\ADMIN_ROADMAP.md