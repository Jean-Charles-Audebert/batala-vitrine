# Organisation CSS du projet

## Fichiers CSS et leur rôle

### `public/css/buttons.css` 
**Boutons d'édition et d'action (pages admin)**
- `.btn-icon` - Bouton icône générique
- `.btn-edit`, `.edit-btn` - Boutons d'édition
- `.btn-trash`, `.delete-btn` - Boutons de suppression
- `.btn-add` - Bouton d'ajout
- `.edit-footer-section-btn` - Boutons d'édition du footer

**Règle importante** : Les icônes des boutons ont `filter: none !important` pour ne jamais être affectées par d'autres styles.

### `public/css/index.css`
**Page d'accueil publique**
- Header, main content, footer
- Blocs de contenu et cartes
- Icônes sociales du footer (`.social-icon`)
- Variables CSS dynamiques depuis la base de données

### `public/css/admin.css`
**Pages d'administration**
- Layouts admin, formulaires, tableaux
- Toolbar, navigation

### `public/css/common.css`
**Styles communs réutilisables**

### `public/css/style.css`
**Reset et styles de base globaux**

### `public/css/login.css`
**Page de connexion**

## Préfixes de classes

Pour faciliter la maintenance :
- `btn-*` : Boutons (ex: `btn-edit`, `btn-trash`)
- `social-*` : Éléments sociaux (ex: `social-icon`, `social-link`)
- `footer-*` : Éléments du footer (ex: `footer-section`, `footer-title`)
- `admin-*` : Éléments admin (ex: `admin-container`, `admin-toolbar`)
- `card-*` : Cartes de contenu
- `block-*` : Blocs de contenu

## Règles importantes

1. **Boutons admin** : Toujours dans `buttons.css`, préfixe `btn-`
2. **Icônes sociales** : Uniquement `.social-icon` dans le footer, toujours blanches (filtre CSS)
3. **Footer** : Le fond doit TOUJOURS être foncé (les icônes sociales sont blanches et ne s'adaptent pas)
4. **Variables CSS** : Définies dans `:root` dans `index.ejs`, utilisées dans `index.css`
5. **Spécificité** : Éviter les sélecteurs trop génériques comme `footer img` ou `button img`

## Comment modifier un style

1. **Identifier l'élément** : Utiliser l'inspecteur du navigateur
2. **Trouver la classe** : Noter le préfixe (btn-, social-, footer-, etc.)
3. **Ouvrir le bon fichier CSS** :
   - Boutons → `buttons.css`
   - Footer → `index.css` (section Footer)
   - Admin → `admin.css`
4. **Modifier et tester**
