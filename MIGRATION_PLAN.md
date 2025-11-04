# 🎯 Plan de Migration - Batala Vitrine WMS

**Date** : 4 novembre 2025  
**Objectif** : Transformer le projet en WMS générique avec WYSIWYG inline

---

## ✅ Ce qui est VALIDÉ et FONCTIONNEL

### Infrastructure
- [x] Node.js (ESM) + Express
- [x] Docker + docker-compose.yml
- [x] PostgreSQL avec auto-init via db/
- [x] Tests Jest (42 tests unitaires) ✅
- [x] Tests E2E Playwright (7 tests) ✅
- [x] Logger centralisé (logger.js)
- [x] CSS variables organisées
- [x] Authentification JWT + Refresh tokens ✅
- [x] Middleware requireAuth.js ✅
- [x] Hash Argon2id pour passwords ✅

### Architecture actuelle
- `src/server.js` : Express setup
- `src/routes/` : Routing modulaire
- `src/controllers/` : Logique métier
- `src/middlewares/` : Auth, etc.
- `src/views/` : Templates **EJS** ✅ (migration terminée)
- `src/utils/` : logger, password, socialIcons

---

## 🗄️ NOUVEAU SCHÉMA DB (Validé)

### Tables créées
1. **admins** : Gestion utilisateurs admin
2. **refresh_tokens** : JWT refresh tokens
3. **page** (singleton) : Thème global (bg_color, text_color, primary_color, secondary_color, font_family, bg_image)
4. **blocks** : Blocs dynamiques (header, events, offers, footer, custom)
   - Champs: type, title, slug, style (JSONB), position, is_active, is_locked, is_collapsible, bg_image, header_logo, header_title
5. **cards** : Template réutilisable pour contenus
   - Champs: block_id, position, title, description, media_path, style (JSONB), event_date (optionnel)
6. **footer_elements** : Éléments footer (about, contact, social)
   - Champs: block_id, type, position, content (JSON)

### Fichiers DB
- ✅ `db/001_schema.sql` : Schéma complet consolidé
- ✅ `db/002_seed.sql` : Données de démo

---

## 🔄 MIGRATIONS À FAIRE

### Phase 1 : Nettoyage ✅ TERMINÉ
- [x] Supprimer scripts obsolètes (seed-block-elements.js)
- [x] Supprimer docs temporaires (SVG_GENERATION_SUMMARY.md, ICONS_REFERENCE.md)
- [x] Réorganiser `public/` :
  - [x] `public/assets/` (images par défaut)
  - [x] `public/icons/` (SVG monochromes - 34 icônes)
  - [x] `public/uploads/` (images admin)
- [x] Mettre à jour `.gitignore` :
  - [x] Ajouter `uploads/*`
  - [x] Garder `uploads/.gitkeep`
- [x] Nettoyer `package.json` (scripts inutilisés)

### Phase 2 : Génération des Icônes SVG ✅ TERMINÉ
Toutes les icônes générées dans `public/icons/` :
- [x] Icônes admin/action : settings, user, edit, plus, trash, save, cancel, arrows, menu, close, palette, image
- [x] Icônes sociales : facebook, twitter, instagram, linkedin, youtube, tiktok, whatsapp, telegram, pinterest, etc.
- [x] Total : 34 icônes SVG monochromes avec `fill="currentColor"`

### Phase 3 : Migration Pug → EJS ✅ TERMINÉ
- [x] Installer EJS : `npm install ejs`
- [x] Convertir toutes les vues :
  - [x] `layout.ejs` (standalone, pas de layout global)
  - [x] `pages/index.ejs` ✅
  - [x] `pages/login.ejs` ✅
  - [x] `pages/admins.ejs` ✅
  - [x] `pages/admin-form.ejs` ✅ (nouveau)
  - [x] `pages/blocks.ejs` ✅ (nouveau)
  - [x] `pages/block-form.ejs` ✅ (nouveau)
  - [x] `components/header.ejs` ✅
  - [x] `components/footer.ejs` ✅
  - [x] `components/content-section.ejs` ✅
  - [x] `components/auth-fab.ejs` ✅
  - [x] `components/card-modal.ejs` ✅
- [x] Adapter `server.js` : `app.set('view engine', 'ejs')`
- [x] Mettre à jour tous les contrôleurs
- [x] Vérifier tests unitaires (42/42 ✅)
- [x] Vérifier tests E2E (7/7 ✅)
- [x] Supprimer fichiers `.pug` (déjà fait)

### Phase 4 : Adaptation Contrôleurs au Nouveau Schéma
- [ ] `homeController.js` :
  - [ ] Charger table `page` pour thème global
  - [ ] Charger `blocks` avec `is_active=true` ORDER BY position
  - [ ] Pour chaque bloc (sauf header/footer) : charger `cards`
  - [ ] Pour footer : charger `footer_elements`
- [ ] Créer `pageController.js` (gestion thème/settings)
- [ ] Adapter `blockController.js` (CRUD blocs)
- [ ] Créer `cardController.js` (CRUD cartes)

### Phase 4 : Admin CRUD Complet ✅ TERMINÉ
- [x] Contrôleur adminController complet (create, edit, delete)
- [x] Contrôleur blockController complet (create, edit, delete, reorder)
- [x] Contrôleur cardController complet (CRUD + reorder) ✨ NOUVEAU
- [x] Formulaires admin-form.ejs, block-form.ejs, card-form.ejs ✨
- [x] Interface de gestion des blocs avec réordonnancement
- [x] Interface de gestion des cartes avec réordonnancement ✨ NOUVEAU
- [x] Routes API pour réordonnancement (/api/blocks/reorder, /api/cards/reorder) ✨
- [x] Routes imbriquées /blocks/:blockId/cards ✨ NOUVEAU
- [x] CSS complet (admin.css avec badges, formulaires, thumbnails)
- [x] Tests unitaires (58 tests passent) ✨ +16 tests
- [x] Tests E2E (7 tests passent)

### Phase 5 : WYSIWYG Inline (Frontend) - EN ATTENTE
- [ ] Boutons "éditer" sur chaque bloc (visible si admin connecté) - ✅ Partiellement (boutons présents)
- [ ] Formulaires inline/modals pour édition rapide
- [ ] Color picker natif (`<input type="color">`)
- [ ] Upload d'images avec preview
- [ ] Drag & drop ordre blocs/cartes (✅ Blocks: fait, Cards: à faire)
- [ ] Menu burger CSS pur (checkbox hack)
- [ ] Gestion des cards (CRUD) depuis l'interface

### Phase 6 : Tests & Validation ✅ LARGEMENT AVANCÉ
- [x] Tests unitaires nouveaux contrôleurs (42 tests)
- [ ] Tests E2E flows WYSIWYG (base présente)
- [ ] Validation accessibilité (axe-core)
- [x] Lighthouse CI (configuré)

---

## 📋 PROCHAINES ÉTAPES PRIORITAIRES

### 1. Gestion des Cards (CRUD) ✅ TERMINÉ
- [x] Créer `cardController.js` avec CRUD complet ✨
- [x] Créer vues `cards.ejs` et `card-form.ejs` ✨
- [x] Ajouter routes dans `cardRoutes.js` (imbriquées sous blocks) ✨
- [x] Tests unitaires pour cardController (11 tests) ✨
- [ ] Permettre l'édition inline depuis les sections de contenu (prochaine étape)

### 2. Upload d'images ✅ TERMINÉ
- [x] Configurer multer pour `public/uploads/` ✨
- [x] Endpoint `/api/upload` pour images ✨
- [x] Preview d'image dans les formulaires ✨
- [x] Validation taille/type fichier (5 MB, JPEG/PNG/WebP/GIF) ✨
- [x] Tests unitaires upload (5 tests) ✨
- [ ] Optimisation images (sharp ?) - optionnel pour plus tard

### 3. Amélioration WYSIWYG
- [ ] Formulaires modaux pour édition rapide
- [ ] Color picker pour personnalisation
- [ ] Drag & drop pour les cards (comme blocks)
- [ ] Sauvegarde automatique (debounced)

### 4. PWA & Performance
- [ ] Service Worker pour offline
- [ ] Manifest.json
- [ ] Optimisation Lighthouse (déjà >90%)
- [ ] Cache strategy pour assets

---

## 📊 État des Epics (à mettre à jour sur GitHub)

### Epic 1 : Infrastructure & Configuration ✅ DONE
- ✅ Docker, PostgreSQL, Tests, Lighthouse CI configurés

### Epic 2 : Authentification et Sécurité ✅ DONE
- ✅ JWT, Refresh tokens, Argon2id, Middlewares
- ✅ Login web + API, Logout, Protection routes

### Epic 3 : Gestion de Contenu (CMS) � LARGEMENT AVANCÉ
- ✅ CRUD Admins complet
- ✅ CRUD Blocks complet avec réordonnancement
- ✅ CRUD Cards complet avec réordonnancement ✨ NOUVEAU
- ✅ Upload images fonctionnel (multer + validation) ✨ NOUVEAU
- ⏳ WYSIWYG inline (partiellement fait - édition basique OK, améliorations à venir)

### Epic 4 : Interface Utilisateur ✅ LARGEMENT AVANCÉ
- ✅ Page publique EJS avec composants réutilisables
- ✅ Auth FAB avec menu
- ✅ Pages admin stylées
- ⏳ PWA (manifest + SW à ajouter)

### Epic 5 : Tests & Qualité ✅ EXCELLENT
- ✅ 58 tests unitaires Jest (100% passing) ✨ +16 tests
- ✅ 7 tests E2E Playwright (100% passing)
- ✅ Lighthouse CI configuré
- ✅ Coverage maintenue à ~73% statements
- ⏳ Tests accessibilité (axe-core à intégrer)

---

## 🎯 Résumé Accomplissements (Nov 2025)

**Terminé :**
- ✅ Migration Pug → EJS complète
- ✅ CRUD Admins, Blocks & Cards avec interfaces web ✨
- ✅ Upload d'images avec multer (validation + preview) ✨
- ✅ Réordonnancement drag-drop pour blocks ET cards ✨
- ✅ 34 icônes SVG monochromes
- ✅ CSS externalisé et organisé (admin.css enrichi)
- ✅ 65 tests (58 unit + 7 E2E) tous passants ✨ +16 tests
- ✅ Cleanup repository (docs obsolètes supprimés)
- ✅ Routes imbriquées /blocks/:blockId/cards ✨

**Dernières additions (4 nov 2025) :**
- ✨ cardController.js : 7 fonctions CRUD + reorder (11 tests)
- ✨ cards.ejs : Table avec drag-drop et contrôles position
- ✨ card-form.ejs : Formulaire avec upload temps réel
- ✨ upload.js : Configuration multer complète (5 tests)
- ✨ POST /api/upload : Endpoint protégé avec validation

**Priorité suivante :** WYSIWYG inline amélioré + PWA (manifest + SW)
