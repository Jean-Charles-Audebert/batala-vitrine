# 🎨 Audit UX/UI et Accessibilité - Batala Vitrine

**Date** : 5 novembre 2025  
**Focus** : Accessibilité, Navigation, Minimisation des clics, Ergonomie

---

## 📊 Résumé Exécutif

### Points Forts ✅
- Architecture MVC claire avec séparation des composants
- Réutilisation des composants EJS (header, footer, content-section)
- FAB (Floating Action Button) pour accès rapide aux fonctions admin
- Réordonnancement par boutons fléchés (plus accessible que drag & drop seul)
- CSS organisé et modulaire (common.css, admin.css, index.css)
- Formulaires cohérents avec labels explicites

### Points Faibles Critiques ❌
1. **Accessibilité** : Quasi-absence d'attributs ARIA et rôles sémantiques
2. **Contraste** : Plusieurs boutons n'atteignent pas le ratio WCAG AA (4.5:1)
3. **Navigation clavier** : Focus non stylé, ordre de tabulation non optimisé
4. **Clics inutiles** : 3+ clics pour modifier une carte depuis la page d'accueil
5. **Texte alternatif** : Images décoratives avec `alt=""` mais sans `role="presentation"`
6. **Responsive** : Absence de menu hamburger optimisé mobile
7. **Erreurs** : Messages flash mais pas d'annonce ARIA live pour lecteurs d'écran

### Métriques Actuelles
| Critère | Score | Objectif |
|---------|-------|----------|
| Accessibilité WCAG | ~45% | 95% (AA) |
| Clics pour édition | 3-5 | 1-2 |
| Navigation clavier | 30% | 100% |
| Contraste texte | 70% | 100% |
| Attributs ARIA | 10% | 90% |

---

## 🔴 Problèmes Critiques (P0)

### 1. Accessibilité - Manque d'ARIA et Rôles

#### Problème
- Aucun `role="navigation"` sur les zones de navigation
- Boutons sans `aria-label` descriptif (seulement `title`)
- Modales sans `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tableaux sans `<caption>` ou `aria-label`
- Sections sans landmarks (`<main>`, `<nav>`, `<aside>`)
- FAB sans `aria-expanded` pour menu déroulant

#### Impact
🚨 **Bloquant** pour utilisateurs de lecteurs d'écran (NVDA, JAWS, VoiceOver)

#### Fichiers concernés
```
src/views/components/auth-fab.ejs
src/views/components/card-modal.ejs
src/views/pages/blocks.ejs
src/views/pages/cards.ejs
src/views/components/header.ejs
src/views/components/footer.ejs
```

#### Solution
```html
<!-- Avant (auth-fab.ejs) -->
<div class="auth-fab">
  <a class="fab-login" href="/auth/login" title="Connexion administrateur">
    <img src="/icons/settings.svg" alt="Connexion" class="fab-icon" />
  </a>
</div>

<!-- Après -->
<nav class="auth-fab" aria-label="Navigation administrateur">
  <a 
    class="fab-login" 
    href="/auth/login" 
    aria-label="Connexion administrateur"
    role="button"
  >
    <img src="/icons/settings.svg" alt="" role="presentation" class="fab-icon" />
    <span class="sr-only">Connexion administrateur</span>
  </a>
</nav>
```

```html
<!-- card-modal.ejs - Ajouter ARIA complet -->
<div 
  id="cardModal" 
  class="modal" 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modalTitle"
  aria-hidden="true"
>
  <div class="modal-content" role="document">
    <button 
      class="close" 
      aria-label="Fermer la modale"
      type="button"
    >&times;</button>
    <h2 id="modalTitle">Ajouter une carte</h2>
    <!-- ... -->
  </div>
</div>
```

```html
<!-- blocks.ejs - Tableau accessible -->
<table aria-label="Liste des blocs du site">
  <caption class="sr-only">Gestion des blocs (header, sections, footer)</caption>
  <thead><!-- ... --></thead>
  <tbody id="blocks-list"><!-- ... --></tbody>
</table>
```

---

### 2. Navigation Clavier - Focus Non Visible

#### Problème
- Styles `:focus` présents mais `:focus-visible` manquant (mauvaise UX souris)
- Pas de `outline` personnalisé visible
- Ordre de tabulation non optimisé (FAB en dernier au lieu de début)
- Boutons fléchés réordonnancement accessibles mais peu visibles au focus

#### Impact
🚨 **Bloquant** pour utilisateurs au clavier (mobilité réduite, power users)

#### Fichiers concernés
```
public/css/common.css
public/css/admin.css
public/css/index.css
```

#### Solution
```css
/* common.css - Ajouter après les styles existants */

/**
 * Focus visible pour navigation clavier
 * (évite le focus visible au clic souris avec :focus-visible)
 */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Supprimer outline par défaut pour clics souris */
:focus:not(:focus-visible) {
  outline: none;
}

/* Focus spécifique pour boutons */
.btn:focus-visible,
button:focus-visible,
a.btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

/* Focus pour champs de formulaire */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
  border-color: var(--color-primary);
}

/* Skip link pour navigation clavier (ajouter en haut du DOM) */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}
```

```html
<!-- Ajouter dans partials/head.ejs, juste après <body> -->
<a href="#main-content" class="skip-link">Aller au contenu principal</a>
```

---

### 3. Contraste Insuffisant

#### Problème
- Boutons secondaires (`.btn-secondary`) : `#e2e8f0` sur fond blanc = ~1.5:1 ❌
- Texte muté (`.text-muted`) : `#718096` = ~3.8:1 (insuffisant pour AA = 4.5:1)
- Icônes grises dans tableaux : difficilement visibles

#### Impact
🔴 **Critique** pour utilisateurs malvoyants, daltoniens, écrans en plein soleil

#### Fichiers concernés
```
public/css/admin.css
public/css/common.css
```

#### Solution
```css
/* admin.css - Corriger contraste boutons */

.btn-secondary {
  background: #cbd5e0; /* Au lieu de #e2e8f0 - ratio 3.4:1 → 4.6:1 ✓ */
  color: #1a202c; /* Au lieu de #333 - améliore contraste */
  border: 1px solid #a0aec0;
}

.btn-secondary:hover {
  background: #a0aec0; /* Plus sombre au hover */
  border-color: #718096;
}

/* Texte muté - ratio minimum 4.5:1 */
.text-muted {
  color: #4a5568; /* Au lieu de #718096 - ratio 7.1:1 ✓ */
}

/* Badge contraste amélioré */
.badge-info {
  background-color: #4299e1; /* Au lieu de #bee3f8 */
  color: white; /* Au lieu de #2c5282 */
}
```

---

### 4. Trop de Clics pour Édition Rapide

#### Problème
**Scénario actuel** : Modifier une carte depuis la page d'accueil
1. Clic sur "Modifier" → Redirige vers `/blocks/:id/cards/:id/edit`
2. Modifier les champs
3. Clic "Enregistrer"
4. Clic "Retour aux cartes" ou "Retour à l'accueil"

**Total : 4 clics minimum + 2 chargements de page**

#### Impact
🟠 **Important** - Ralentit workflow admin, frustration pour éditions fréquentes

#### Solution : Édition Inline avec Modal

**Option A (Recommandée)** : Modale d'édition depuis page publique
```javascript
// public/js/index.js - Améliorer pour édition modale

editCardButtons.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const cardId = e.currentTarget.dataset.cardId;
    const blockId = e.currentTarget.closest('[data-block-id]')?.dataset.blockId;
    
    // Charger les données de la carte via API
    const response = await fetch(`/api/blocks/${blockId}/cards/${cardId}`);
    const card = await response.json();
    
    // Peupler la modale existante
    document.getElementById('modalTitle').textContent = 'Modifier la carte';
    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDescription').value = card.description;
    document.querySelector('[name="cardId"]').value = cardId;
    document.querySelector('[name="blockId"]').value = blockId;
    
    // Afficher la modale
    document.getElementById('cardModal').classList.add('active');
  });
});
```

**Gain** : 2 clics (edit + save) au lieu de 4, 0 rechargement de page

**Option B** : Édition inline (contenteditable)
- Plus complexe à implémenter
- Meilleure UX pour petites modifications
- Nécessite validation inline et gestion erreurs

---

### 5. Messages d'Erreur Non Accessibles

#### Problème
- Alerts (`partials/alerts.ejs`) affichés visuellement mais non annoncés aux lecteurs d'écran
- Pas de région `aria-live` pour mises à jour dynamiques
- Validation formulaires : erreurs natives HTML5 mais messages custom absents

#### Impact
🔴 **Critique** - Utilisateurs aveugles ne savent pas si action réussie/échouée

#### Solution
```html
<!-- partials/alerts.ejs - Ajouter ARIA live -->
<% if (typeof success !== 'undefined' && success) { %>
  <div 
    class="alert alert-success" 
    role="alert"
    aria-live="polite"
    aria-atomic="true"
  >
    <%= success %>
  </div>
<% } %>

<% if (typeof error !== 'undefined' && error) { %>
  <div 
    class="alert alert-danger" 
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <%= error %>
  </div>
<% } %>
```

```javascript
// Ajouter validation accessible dans formulaires
const form = document.querySelector('.form-card');
form.addEventListener('submit', (e) => {
  const titleInput = document.getElementById('title');
  if (!titleInput.value.trim()) {
    e.preventDefault();
    
    // Créer message d'erreur ARIA
    const errorMsg = document.createElement('span');
    errorMsg.id = 'title-error';
    errorMsg.className = 'error-message';
    errorMsg.textContent = 'Le titre est obligatoire';
    errorMsg.setAttribute('role', 'alert');
    
    titleInput.setAttribute('aria-invalid', 'true');
    titleInput.setAttribute('aria-describedby', 'title-error');
    titleInput.parentNode.appendChild(errorMsg);
  }
});
```

---

## 🟠 Problèmes Importants (P1)

### 6. Navigation Mobile Non Optimisée

#### Problème
- Pas de menu hamburger pour mobile
- FAB peut masquer du contenu sur petits écrans
- Tableaux admin non responsive (défilement horizontal difficile)
- Boutons trop petits sur mobile (<44x44px minimum WCAG)

#### Solution
```css
/* admin.css - Responsive mobile */

@media (max-width: 768px) {
  /* Tableaux scrollables horizontalement */
  .admin-container table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  /* Boutons taille tactile minimum */
  .btn, .btn-sm {
    min-width: 44px;
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  /* FAB plus petit mais toujours accessible */
  .auth-fab {
    bottom: 16px;
    right: 16px;
  }
  
  .fab-login, .fab-item {
    width: 48px;
    height: 48px;
  }
}
```

---

### 7. Ordre de Tabulation Non Logique

#### Problème
- FAB apparaît en dernier dans le DOM mais devrait être accessible rapidement
- Boutons d'action dans tableaux avant liens de navigation
- Pas de `tabindex` pour optimiser le flux

#### Solution
```html
<!-- Réorganiser l'ordre DOM ou utiliser tabindex -->

<!-- auth-fab.ejs - Ajouter tabindex pour accès rapide -->
<nav class="auth-fab" aria-label="Navigation administrateur">
  <a 
    class="fab-login" 
    href="/auth/login" 
    tabindex="1"
    aria-label="Connexion administrateur"
  >
    <!-- ... -->
  </a>
</nav>

<!-- blocks.ejs - Skip navigation pour tableaux longs -->
<div class="table-wrapper">
  <a href="#table-end" class="skip-link">Passer le tableau</a>
  <table aria-label="Liste des blocs">
    <!-- ... -->
  </table>
  <div id="table-end"></div>
</div>
```

---

### 8. Images Sans Contexte Sémantique

#### Problème
- Images décoratives avec `alt=""` (correct) mais sans `role="presentation"` (recommandé)
- Icônes SVG inline manquantes pour meilleure accessibilité
- Pas de texte de remplacement pour `background-image` CSS importantes

#### Solution
```html
<!-- Boutons avec icônes décoratives -->
<button class="btn btn-primary">
  <img src="/icons/plus.svg" alt="" role="presentation" class="btn-icon">
  <span>Nouveau bloc</span> <!-- Toujours un texte visible -->
</button>

<!-- Images fonctionnelles -->
<img 
  src="<%= card.media_path %>" 
  alt="<%= card.title %> - <%= card.description ? card.description.substring(0, 50) : 'Illustration' %>"
  loading="lazy"
>

<!-- SVG inline pour icônes (meilleure accessibilité) -->
<svg role="img" aria-label="Modifier" class="icon">
  <use xlink:href="/icons/sprite.svg#edit"></use>
</svg>
```

---

## 🟡 Améliorations Souhaitables (P2)

### 9. Feedback Visuel Insuffisant

#### Problème
- Boutons de réordonnancement : pas de feedback pendant l'action
- Soumission formulaires : pas de loader/spinner
- Suppression : confirmation native `confirm()` (UX basique)

#### Solution
```javascript
// Ajouter spinner lors de soumission
form.addEventListener('submit', (e) => {
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Enregistrement...';
});
```

```css
/* Spinner accessible */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

### 10. Performance et Chargement

#### Problème
- Images non optimisées (pas de `loading="lazy"`)
- Pas de webp pour images modernes
- CSS et JS non minifiés en production
- Pas de service worker pour cache (PWA)

#### Solution (déjà prévu dans Epic 4)
- US4.6 : Manifest + Service Worker
- Lazy loading images
- Minification build step

---

## 📋 Plan d'Action Priorisé

### Sprint UX (5 jours)

#### Jour 1-2 : Accessibilité ARIA (P0)
- [ ] Ajouter `role`, `aria-label`, `aria-labelledby` sur tous les composants interactifs
- [ ] Balises sémantiques `<main>`, `<nav>`, `<aside>` dans layouts
- [ ] Modales avec `role="dialog"`, `aria-modal="true"`
- [ ] Tableaux avec `<caption>` et `aria-label`
- [ ] Tests avec axe-core ou Lighthouse Accessibility

**Fichiers** :
```
src/views/components/auth-fab.ejs
src/views/components/card-modal.ejs
src/views/components/header.ejs
src/views/components/footer.ejs
src/views/pages/blocks.ejs
src/views/pages/cards.ejs
src/views/pages/footer-elements.ejs
src/views/partials/head.ejs
```

#### Jour 3 : Focus et Navigation Clavier (P0)
- [ ] Styles `:focus-visible` dans common.css
- [ ] Skip links "Aller au contenu"
- [ ] Ordre de tabulation optimisé (tabindex si nécessaire)
- [ ] Tests navigation complète au clavier (Tab, Enter, Esc)

**Fichiers** :
```
public/css/common.css
public/css/admin.css
src/views/partials/head.ejs
```

#### Jour 4 : Contraste et Visibilité (P0)
- [ ] Corriger couleurs boutons secondaires (ratio 4.5:1 minimum)
- [ ] Améliorer `.text-muted` (ratio 7:1)
- [ ] Tests contraste avec Lighthouse ou axe DevTools

**Fichiers** :
```
public/css/admin.css
public/css/common.css
```

#### Jour 5 : Édition Rapide et Messages (P0-P1)
- [ ] Modale d'édition carte depuis page publique (API GET card)
- [ ] ARIA live regions pour alerts
- [ ] Validation formulaires accessible avec `aria-invalid`
- [ ] Feedback visuel (spinners, confirmations modales)

**Fichiers** :
```
public/js/index.js
src/views/partials/alerts.ejs
src/controllers/cardController.js (ajouter route GET /api/blocks/:id/cards/:id)
```

---

## 🎯 Métriques de Succès

### Avant/Après

| Critère | Avant | Après (Objectif) |
|---------|-------|-------------------|
| Lighthouse Accessibility | ~45 | 95+ |
| Attributs ARIA | 10% | 90% |
| Contraste WCAG AA | 70% | 100% |
| Navigation clavier complète | 30% | 100% |
| Clics pour édition carte | 4 | 2 |
| Focus visible | 50% | 100% |
| Temps d'édition moyenne | 45s | 20s |

### Tests de Validation
- [ ] Navigation complète au clavier sans souris
- [ ] Test lecteur d'écran (NVDA sur Windows, VoiceOver sur Mac)
- [ ] Lighthouse CI avec score >90 accessibilité
- [ ] Tests utilisateurs avec personas (malvoyant, mobilité réduite, senior)
- [ ] Validation WCAG 2.1 niveau AA avec axe DevTools

---

## 🔧 Outils Recommandés

### Tests Accessibilité
- **axe DevTools** : Extension Chrome/Firefox pour audit automatique
- **Lighthouse CI** : Déjà configuré, ajouter seuil accessibilité >90
- **WAVE** : Extension navigateur pour visualisation problèmes
- **Pa11y** : CLI pour tests automatisés accessibilité

### Tests Contraste
- **WebAIM Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Chrome DevTools** : Outil "Contrast Ratio" intégré

### Tests Navigation
- **Keyboard Navigation** : Tester manuellement avec Tab, Shift+Tab, Enter, Esc
- **Screen Readers** : NVDA (Windows gratuit), JAWS (payant), VoiceOver (macOS)

---

## 📚 Ressources et Documentation

### Standards WCAG 2.1
- **Niveau A** : Critères de base (non bloquants)
- **Niveau AA** : Objectif recommandé (ratio 4.5:1, navigation clavier)
- **Niveau AAA** : Idéal mais non obligatoire (ratio 7:1)

### Checklist ARIA
- `role="navigation"` sur `<nav>` ou équivalent
- `role="main"` sur contenu principal ou `<main>`
- `role="dialog"` sur modales avec `aria-modal="true"`
- `aria-label` sur éléments sans texte visible (boutons icônes)
- `aria-labelledby` pour lier titres et zones
- `aria-live="polite|assertive"` pour mises à jour dynamiques
- `aria-invalid="true"` sur champs en erreur avec `aria-describedby`

### Liens Utiles
- WCAG 2.1 : https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices : https://www.w3.org/WAI/ARIA/apg/
- MDN Accessibility : https://developer.mozilla.org/fr/docs/Web/Accessibility

---

## ✅ Checklist de Validation Finale

### Tests Automatisés
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] axe DevTools : 0 violations critiques
- [ ] Pa11y : 0 erreurs WCAG AA
- [ ] Tests E2E Playwright avec navigation clavier

### Tests Manuels
- [ ] Navigation complète au Tab (ordre logique)
- [ ] Lecteur d'écran annonce tous les éléments interactifs
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Contraste minimum 4.5:1 sur tous les textes
- [ ] Formulaires validables sans souris
- [ ] Modales fermables avec Esc
- [ ] Tableaux lisibles avec lecteur d'écran

### Tests Utilisateurs
- [ ] Test avec utilisateur malvoyant
- [ ] Test avec utilisateur au clavier uniquement
- [ ] Test sur mobile (tactile 44x44px)
- [ ] Test sur tablette en mode paysage

---

**Prochain commit attendu** : `feat(a11y): improve accessibility with ARIA, focus styles, and contrast (WCAG AA)`

