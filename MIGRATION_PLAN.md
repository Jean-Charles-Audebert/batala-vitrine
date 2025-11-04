# 🎯 Plan de Migration - Batala Vitrine WMS

**Date** : 4 novembre 2025  
**Objectif** : Transformer le projet en WMS générique avec WYSIWYG inline

---

## ✅ Ce qui est VALIDÉ et FONCTIONNEL

### Infrastructure
- [x] Node.js (ESM) + Express
- [x] Docker + docker-compose.yml
- [x] PostgreSQL avec auto-init via db/
- [x] Tests Jest (26 tests unitaires) ✅
- [x] Tests E2E Playwright ✅
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
- `src/views/` : Templates **Pug** (à migrer vers EJS)
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

### Phase 1 : Nettoyage (URGENT - MAINTENANT)
- [ ] Supprimer dossier `migrations/` (obsolète)
- [ ] Réorganiser `public/` :
  - [ ] Créer `public/assets/` (images par défaut)
  - [ ] Créer `public/icons/` (SVG monochromes)
  - [ ] Créer `public/uploads/` (images admin)
  - [ ] Déplacer images actuelles vers assets/
- [ ] Mettre à jour `.gitignore` :
  - [ ] Ajouter `uploads/*`
  - [ ] Garder `uploads/.gitkeep`
- [ ] Nettoyer `package.json` (scripts inutilisés)

### Phase 2 : Génération des Icônes SVG (Batch)
Liste complète à générer dans `public/icons/` :
- [ ] `settings.svg` (roue crantée)
- [ ] `user.svg` (connexion)
- [ ] `edit.svg`
- [ ] `plus.svg`
- [ ] `trash.svg`
- [ ] `save.svg`
- [ ] `cancel.svg`
- [ ] `arrow-up.svg`
- [ ] `arrow-down.svg`
- [ ] `menu.svg` (burger)
- [ ] `close.svg` (X)
- [ ] `facebook.svg`
- [ ] `twitter.svg`
- [ ] `instagram.svg`
- [ ] `linkedin.svg`
- [ ] `youtube.svg`
- [ ] `tiktok.svg`
- [ ] `palette.svg` (color picker)
- [ ] `image.svg` (upload)

### Phase 3 : Migration Pug → EJS
- [ ] Installer EJS : `npm install ejs`
- [ ] Convertir vues :
  - [ ] `layout.pug` → `layout.ejs`
  - [ ] `index.pug` → `index.ejs`
  - [ ] `login.pug` → `login.ejs`
  - [ ] `admins.pug` → `admins.ejs`
  - [ ] `components/header.pug` → `components/header.ejs`
  - [ ] `components/footer.pug` → `components/footer.ejs`
  - [ ] `components/content-section.pug` → `components/content-section.ejs`
- [ ] Adapter `server.js` : `app.set('view engine', 'ejs')`
- [ ] Mettre à jour contrôleurs (si nécessaire)
- [ ] Vérifier tests unitaires
- [ ] Vérifier tests E2E
- [ ] Supprimer fichiers `.pug`

### Phase 4 : Adaptation Contrôleurs au Nouveau Schéma
- [ ] `homeController.js` :
  - [ ] Charger table `page` pour thème global
  - [ ] Charger `blocks` avec `is_active=true` ORDER BY position
  - [ ] Pour chaque bloc (sauf header/footer) : charger `cards`
  - [ ] Pour footer : charger `footer_elements`
- [ ] Créer `pageController.js` (gestion thème/settings)
- [ ] Adapter `blockController.js` (CRUD blocs)
- [ ] Créer `cardController.js` (CRUD cartes)

### Phase 5 : WYSIWYG Inline (Frontend)
- [ ] Boutons "éditer" sur chaque bloc (visible si admin connecté)
- [ ] Formulaires inline/modaux pour édition
- [ ] Color picker natif (`<input type="color">`)
- [ ] Upload d'images avec preview
- [ ] Drag & drop ordre blocs/cartes (SortableJS ou vanilla JS)
- [ ] Menu burger CSS pur (checkbox hack)

### Phase 6 : Tests & Validation
- [ ] Tests unitaires nouveaux contrôleurs
- [ ] Tests E2E flows WYSIWYG
- [ ] Validation accessibilité (axe-core)
- [ ] Lighthouse CI

---

## 📋 PROCHAINES ÉTAPES IMMÉDIATES

1. **Nettoyage du repo** (toi ou moi ?)
2. **Génération batch des icônes SVG** (je peux faire ça maintenant)
3. **Test du nouveau schéma DB** :
   ```powershell
   docker-compose down -v
   docker-compose up -d db
   docker exec -i batala_vitrine_db psql -U postgres -d batala_vitrine -c "\dt"
   ```
4. **Migration Pug → EJS** (je peux commencer dès validation)

---

## 🤔 QUESTIONS EN SUSPENS

### GitHub Issues
- Tu n'as pas accès direct au GitHub Projects ? Faut-il que je génère un script pour créer/mettre à jour les issues via GitHub CLI ?
- Ou tu préfères gérer ça manuellement côté GitHub après chaque phase ?

### Décisions techniques
- Drag & drop : SortableJS (léger, 5KB) ou vanilla JS (plus de code mais 0 dep) ?
- Upload images : multer (déjà dans package.json) ou autre ?
- Validation accessibilité : axe-core (auto) ou revue manuelle ?

---

## 📊 État des Epics (à mettre à jour sur GitHub)

### Epic 1 : Infrastructure & Configuration
- ✅ DONE : US1.1, US1.2, US1.3, US1.4, US1.5
- 🟡 IN PROGRESS : US1.6 (GitHub Actions)
- 📝 TODO : US1.7 (SonarCloud), US1.8 (Copilot Projects)

### Epic 2 : Authentification et Sécurité
- ✅ DONE : US2.1, US2.2
- 📝 TODO : US2.3, US2.4, US2.5

### Epic 3 : Gestion de Contenu (CMS)
- 📝 TODO : Tout (WYSIWYG inline à implémenter)

### Epic 4 : Interface Utilisateur (PWA)
- 🟡 IN PROGRESS : US4.1 (Page publique - en refacto)
- 📝 TODO : US4.2, US4.4, US4.5, US4.6

### Epic 5 : Tests & Qualité
- ✅ DONE : US5.1, US5.2 (à adapter après refacto)

---

**Prêt à commencer ?** Dis-moi par quelle phase on attaque ! 🚀
