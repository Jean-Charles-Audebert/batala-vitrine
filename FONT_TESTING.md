# 🧪 Guide de test — Système de polices

## ✅ Prérequis
- Serveur lancé : `npm run dev`
- Base de données migrée (migration 006 appliquée)
- Admin account : `admin@batala.fr` / `SecureP@ss123`

## 🎯 Tests à effectuer

### Test 1 : Polices système (déjà OK)
1. Connectez-vous : http://localhost:3000/auth/login
2. Allez sur : http://localhost:3000/fonts
3. ✅ Vérifiez que 6 polices système apparaissent (Arial, Helvetica, etc.)

### Test 2 : Google Fonts
1. Sur `/fonts`, cliquez sur **"Google Fonts"**
2. Remplissez :
   - **Nom** : `Roboto Bold`
   - **URL** : `https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap`
   - **Famille CSS** : `'Roboto', sans-serif`
3. Cliquez sur **"Ajouter la police"**
4. ✅ Vérifiez redirection vers `/fonts` avec message de succès
5. ✅ Vérifiez que "Roboto Bold" apparaît dans la liste

### Test 3 : Sélection et application d'une police
1. Éditez le **bloc Header** : http://localhost:3000/blocks/1/edit
2. Dans la section **"Police des titres (h1-h6)"**, sélectionnez **"Roboto Bold"**
3. Enregistrez
4. Retournez sur la page d'accueil : http://localhost:3000
5. ✅ Inspectez les titres (h1, h2, h3, etc.) → tous doivent utiliser Roboto
6. ✅ Ouvrez les DevTools → onglet Network → vérifiez que la police Google Fonts est chargée

### Test 4 : Upload d'une police depuis le PC
1. Téléchargez une police .woff2 (exemple : https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2)
2. Sur `/fonts`, utilisez le formulaire d'upload rapide :
   - **Nom** : `Ma Police Custom`
   - **Famille CSS** : `'MaPolice', sans-serif`
   - **Fichier** : Sélectionnez votre .woff2
3. Cliquez sur **"Uploader"**
4. ✅ Vérifiez que la police apparaît dans la bibliothèque avec badge "UPLOAD"
5. ✅ Éditez le Header, sélectionnez cette police
6. ✅ Vérifiez sur la page d'accueil que la police est appliquée
7. ✅ Inspectez → vérifiez qu'un fichier `/uploads/font-XXXXXXX.woff2` est chargé

### Test 5 : Suppression d'une police
1. Sur `/fonts`, cliquez sur **poubelle** à côté de "Ma Police Custom"
2. Confirmez la suppression
3. ✅ La police disparaît de la liste
4. ✅ Le fichier `/uploads/font-XXXXXXX.woff2` est supprimé du disque
5. ✅ Les polices système ne peuvent PAS être supprimées (bouton absent)

### Test 6 : Vérification CSP et @font-face
1. Ouvrez DevTools → onglet Console
2. ✅ Aucune erreur CSP pour `font-src` ou `style-src`
3. Inspectez le `<head>` de la page :
   - ✅ Si Google Font : `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`
   - ✅ Si Upload : bloc `<style>` avec `@font-face`
4. ✅ La variable CSS `--global-title-font` est définie dans `:root`

## 📊 Checklist de validation

- [ ] Connexion admin fonctionne
- [ ] Page `/fonts` charge avec 6 polices système
- [ ] Ajout Google Fonts réussit
- [ ] Police Google Fonts apparaît dans le sélecteur du Header
- [ ] Sélection d'une police Google → appliquée à tous les titres
- [ ] Upload d'un .woff2 réussit
- [ ] Police uploadée apparaît dans le sélecteur
- [ ] Sélection d'une police uploadée → appliquée à tous les titres
- [ ] Suppression d'une police custom → supprime aussi le fichier
- [ ] Aucune erreur CSP dans la console
- [ ] Les h1, h2, h3, h4, h5, h6 utilisent tous la même police globale

## 🐛 Dépannage

**Problème** : Police Google Fonts ne charge pas
- Vérifiez la CSP dans DevTools → doit autoriser `fonts.googleapis.com` et `fonts.gstatic.com`
- Vérifiez l'URL copiée depuis Google Fonts (doit commencer par `https://`)

**Problème** : Police uploadée ne s'affiche pas
- Vérifiez que `/uploads/font-XXX.woff2` est accessible : http://localhost:3000/uploads/font-XXX.woff2
- Vérifiez la CSP → `font-src 'self'` doit être présent
- Inspectez le `<style>` dans le `<head>` → doit contenir `@font-face`

**Problème** : Tous les titres n'utilisent pas la police
- Inspectez un titre → vérifiez `font-family` dans les DevTools
- Vérifiez que la variable CSS `--global-title-font` contient la bonne valeur
- Rechargez la page en vidant le cache (Ctrl+Shift+R)

## 📝 Commandes utiles

```powershell
# Vérifier la police actuelle en base
docker exec batala_vitrine_db psql -U postgres -d batala_vitrine -c "SELECT p.title_font_id, f.name, f.font_family, f.source FROM page p LEFT JOIN fonts f ON p.title_font_id = f.id WHERE p.id=1;"

# Lister toutes les polices
docker exec batala_vitrine_db psql -U postgres -d batala_vitrine -c "SELECT id, name, source, font_family FROM fonts ORDER BY source, name;"

# Vérifier les fichiers uploadés
ls public/uploads/font-*

# Nettoyer les fichiers orphelins
docker exec batala_vitrine_db psql -U postgres -d batala_vitrine -c "SELECT file_path FROM fonts WHERE source='upload';"
```

## ✨ Résultat attendu final

Une fois tous les tests passés :
- Bibliothèque de polices opérationnelle (système + Google + uploads)
- Un seul sélecteur dans le formulaire Header
- Une seule police appliquée à TOUS les titres du site
- Interface intuitive avec guides et badges
- Gestion des fichiers propre (suppression automatique)
