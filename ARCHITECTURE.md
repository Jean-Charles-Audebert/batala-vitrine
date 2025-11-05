# Architecture du Projet

## Structure des dossiers

```
batala-vitrine/
├── public/              # Assets statiques
│   ├── css/            # Styles CSS
│   │   ├── common.css  # Design system + composants réutilisables
│   │   ├── admin.css   # Styles admin
│   │   ├── index.css   # Styles page publique
│   │   └── login.css   # Styles page login
│   ├── js/             # Scripts client
│   │   ├── block-form.js     # Logique formulaire bloc
│   │   ├── image-upload.js   # Gestion upload images
│   │   └── index.js          # Scripts page publique
│   ├── icons/          # Icônes SVG
│   ├── assets/         # Images et médias
│   └── uploads/        # Images uploadées
├── src/
│   ├── config/         # Configuration (DB, upload, cookies)
│   ├── controllers/    # Logique métier (thin controllers)
│   ├── services/       # Services réutilisables (DB queries)
│   ├── middlewares/    # Middlewares Express
│   ├── routes/         # Définition des routes
│   ├── utils/          # Utilitaires (logger, helpers)
│   └── views/          # Templates EJS
│       ├── components/ # Composants réutilisables (header, footer)
│       ├── pages/      # Pages complètes
│       └── partials/   # Partials (head, footer, alerts, toolbar)
├── tests/
│   ├── unit/           # Tests unitaires (Jest)
│   └── e2e/            # Tests E2E (Playwright)
└── db/                 # Scripts SQL

```

## Principes d'architecture

### Séparation des responsabilités

1. **Controllers** (`src/controllers/`) :
   - Logique minimale (thin controllers)
   - Gestion des requêtes/réponses HTTP
   - Délèguent la logique métier aux services
   - Utilisent les helpers pour la gestion d'erreurs

2. **Services** (`src/services/`) :
   - Logique métier réutilisable
   - Requêtes DB complexes
   - Pas de dépendance à Express (req/res)
   - Testables unitairement

3. **Views** (`src/views/`) :
   - **Rendu HTML uniquement**
   - Pas de logique métier
   - Utilisation de partials pour éviter la duplication
   - Scripts chargés depuis `public/js/`

4. **Scripts client** (`public/js/`) :
   - Logique UI côté client
   - Gestion des événements
   - Appels API asynchrones
   - Pas de scripts inline dans les vues

### Design System

`public/css/common.css` centralise :
- Variables CSS (couleurs, espacements, transitions)
- Composants réutilisables (.btn, .alert, .form-group, tables)
- Utilitaires (spacing, text utilities)

### Helpers et utilitaires

**`src/utils/controllerHelpers.js`** :
- `asyncHandler()` : Wrapper pour gestion d'erreurs async
- `handleControllerError()` : Gestion d'erreurs standardisée
- `validateRequiredFields()` : Validation de champs

**`src/services/`** :
- `blockService.js` : Opérations DB sur les blocs
- `cardService.js` : Opérations DB sur les cartes

## Patterns de code

### Controllers

```javascript
import { asyncHandler, handleControllerError } from "../utils/index.js";
import { getBlockById } from "../services/index.js";

export const showBlock = async (req, res) => {
  try {
    const block = await getBlockById(req.params.id);
    if (!block) {
      return res.status(404).send("Bloc introuvable");
    }
    res.render("pages/block", { block });
  } catch (error) {
    handleControllerError(error, res, "Erreur DB", "Erreur serveur", "/blocks");
  }
};
```

### Views (EJS)

```ejs
<%- include('../partials/head', {
  title: 'Mon Titre',
  stylesheets: ['/css/common.css', '/css/admin.css']
}) %>

  <div class="container">
    <%- include('../partials/alerts') %>
    <!-- Contenu -->
  </div>

<%- include('../partials/footer', {
  scripts: ['/js/mon-script.js']
}) %>
```

### Scripts client

```javascript
// public/js/mon-script.js
function initFeature() {
  console.log('[Feature] Initialisation...');
  // Logique métier
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeature);
} else {
  initFeature();
}
```

## Bonnes pratiques

1. ✅ **Pas de scripts inline** dans les vues
2. ✅ **Controllers minces** : déléguer aux services
3. ✅ **Réutiliser les composants** : partials + common.css
4. ✅ **Logging systématique** : logger.info/error
5. ✅ **Tests** : Jest (unit) + Playwright (E2E)
6. ✅ **Validation** : côté client ET serveur
7. ✅ **Gestion d'erreurs** : try/catch + handleControllerError

## Points d'entrée

- **Server** : `src/server.js`
- **Routes** : `src/routes/*.js`
- **Database** : `src/config/db.js`
- **Tests** : `npm test` (Jest), `npm run e2e` (Playwright)
