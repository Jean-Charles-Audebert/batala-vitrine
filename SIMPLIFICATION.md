# Simplification de l'Architecture des Sections

## Problème Identifié

Mélange de deux systèmes incompatibles :
1. **Ancien** : `section.elements[]` avec logique métier dans les templates
2. **Nouveau** : `section.settings{}` avec configuration JSON pure

Résultat : Complexité excessive, code dupliqué, difficile à maintenir.

## Solution Proposée

### Principe Simple

```
Formulaire → JSON → Base de données → Template affiche le JSON
```

**C'est tout !** Pas de logique métier, pas de "elements", pas de calculs complexes.

### Exemple Concret

#### Ce qui est sauvegardé (section.settings) :

```json
{
  "background": {
    "bg_type": "color",
    "bg_color": "#1a1a1a",
    "bg_opacity": 1
  },
  "title": {
    "title_visible": true,
    "title_text": "Bienvenue",
    "title_color": "#ffffff",
    "title_size": "h1"
  }
}
```

#### Template SIMPLE (hero.ejs) :

```ejs
<%
const s = section.settings || {};
const bg = s.background || {};
const title = s.title || {};
%>

<header style="background-color: <%= bg.bg_color %>; opacity: <%= bg.bg_opacity %>">
  <% if (title.title_visible) { %>
    <<%= title.title_size %>><%= title.title_text %></<%= title.title_size %>>
  <% } %>
</header>
```

**15 lignes au lieu de 150 !**

## Que Faire Maintenant ?

### Option 1 : Repartir de Zéro (RECOMMANDÉ)

1. Supprimer `hero-new.ejs`, `hero.ejs` actuel
2. Créer un `hero.ejs` ultra-simple qui lit juste `section.settings`
3. Même chose pour `standard.ejs` et `footer.ejs`

**Avantage** : Code propre, maintenable, compréhensible

### Option 2 : Continuer avec le Code Actuel

**Inconvénient** : Vous aurez toujours ce mélange complexe à maintenir

## Mon Erreur

J'ai voulu faire cohabiter l'ancien système (`elements`) avec le nouveau (`settings`), alors qu'il fallait simplement remplacer complètement l'ancien.

Le template ne devrait **jamais** :
- Chercher des `elements`
- Calculer des positions
- Avoir des fonctions `getPositionClasses()`
- Prendre des décisions métier

Il devrait **uniquement** :
- Lire `section.settings`
- Afficher les valeurs
- Appliquer les styles CSS

## Question pour Vous

Voulez-vous que je :
1. **Simplifie radicalement** en recréant des templates minimalistes ?
2. Continue avec le code actuel (mais il restera complexe) ?

Je recommande fortement l'option 1.
