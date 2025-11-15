# Guide de déploiement - Migrations automatiques

## 🎯 Nouveau système de migrations

Le projet intègre maintenant un système de migrations automatiques avec tracking.

### Comment ça fonctionne

1. **Au démarrage du conteneur** :
   - `init-db.js` : Crée le schéma et les données initiales (si tables absentes)
   - `run-migrations.js` : Applique toutes les migrations non encore exécutées
   - Table `migrations_log` : Track les migrations déjà appliquées

2. **Ajout d'une nouvelle migration** :
   ```bash
   # Créer un fichier dans db/ avec numéro séquentiel
   touch db/011_add_new_feature.sql
   ```

3. **Lors du prochain déploiement** :
   - La migration sera automatiquement détectée et appliquée
   - Le système évite les duplications grâce au tracking

## 📋 Migrations actuelles

| Fichier | Description | Statut |
|---------|-------------|--------|
| `001_schema.sql` | Schéma initial | ✅ Appliqué par init-db |
| `002_seed.sql` | Données de démo | ✅ Appliqué par init-db |
| `003_add_description_bg_color.sql` | Couleur fond description | ✅ Auto |
| `004_add_custom_fonts.sql` | Table polices custom | ✅ Auto |
| `005_add_custom_font_urls.sql` | URLs polices Google | ✅ Auto |
| `006_simplify_fonts.sql` | Simplification polices | ✅ Auto |
| `007_add_media_types.sql` | Types média (photo/video) | ✅ Auto |
| `008_make_card_title_nullable.sql` | Titre carte optionnel | ✅ Auto |
| `009_add_media_path_original.sql` | Path original (revert) | ✅ Auto |
| `010_remove_media_path_original.sql` | Suppression path original | ✅ Auto |

## 🚀 Déploiement sur le serveur

### Déploiement automatique (recommandé)

```bash
# Depuis votre machine locale
git push origin main

# Le webhook GitHub déclenche le déploiement automatique
# Les migrations sont appliquées automatiquement
```

### Déploiement manuel

```bash
# Sur le serveur NAS
cd /volume1/docker/batala-vitrine
./nas-deploy.sh

# Les migrations sont appliquées au démarrage du conteneur
```

### Vérifier l'état des migrations

```bash
# Depuis le serveur
docker exec batala-vitrine-app-1 node scripts/run-migrations.js

# Ou directement en SQL
docker exec batala-vitrine-db-1 psql -U postgres -d batala_vitrine \
  -c "SELECT * FROM migrations_log ORDER BY applied_at"
```

## 🔧 Résolution de problèmes

### Erreur "column does not exist"

**Cause** : Une migration n'a pas été appliquée.

**Solution** :
```bash
# Redémarrer le conteneur pour forcer l'application des migrations
docker-compose -f docker-compose.prod.yml restart app

# Vérifier les logs
docker logs batala-vitrine-app-1 --tail=100
```

### Forcer la réapplication d'une migration

```bash
# Supprimer l'entrée dans migrations_log
docker exec batala-vitrine-db-1 psql -U postgres -d batala_vitrine \
  -c "DELETE FROM migrations_log WHERE migration_file = '007_add_media_types.sql'"

# Redémarrer le conteneur
docker-compose -f docker-compose.prod.yml restart app
```

### Reset complet de la base de données

```bash
# ⚠️ ATTENTION : Supprime toutes les données !
cd /volume1/docker/batala-vitrine
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Créer une nouvelle migration

1. **Créer le fichier** avec le prochain numéro séquentiel :
   ```bash
   # Exemple : 011_add_comments.sql
   touch db/011_add_comments.sql
   ```

2. **Écrire le SQL** :
   ```sql
   -- Migration 011: Ajouter système de commentaires
   CREATE TABLE IF NOT EXISTS comments (
     id SERIAL PRIMARY KEY,
     card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
     author VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_comments_card_id ON comments(card_id);
   ```

3. **Tester localement** :
   ```bash
   npm run dev
   # Les migrations sont appliquées automatiquement
   ```

4. **Commit et déployer** :
   ```bash
   git add db/011_add_comments.sql
   git commit -m "feat: add comments system"
   git push
   ```

## 🎯 Best practices

1. **Toujours utiliser IF EXISTS / IF NOT EXISTS** pour l'idempotence
2. **Numéroter les migrations séquentiellement** (001, 002, 003...)
3. **Une migration = une fonctionnalité** (pas de gros changements multiples)
4. **Tester localement avant de déployer**
5. **Documenter les changements** dans les commentaires SQL

## 📊 Scripts disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `init-db.js` | Auto au démarrage | Initialise le schéma de base |
| `run-migrations.js` | Auto au démarrage | Applique les migrations |
| `migrate-db.sh` | Manuel | Script bash alternatif |
| `nas-deploy.sh` | Déploiement | Déploie sur le NAS |

## ✅ Checklist de déploiement

- [ ] Nouvelle migration créée dans `db/`
- [ ] Migration testée localement
- [ ] Commit avec message descriptif
- [ ] Push vers `main`
- [ ] Vérifier le déploiement automatique
- [ ] Vérifier les logs du serveur
- [ ] Tester l'application en production
- [ ] Vérifier `migrations_log` en base

## 🆘 Support

En cas de problème, consulter les logs :
```bash
# Logs du conteneur app
docker logs batala-vitrine-app-1 --tail=200 -f

# Logs du conteneur db
docker logs batala-vitrine-db-1 --tail=100

# État des migrations
docker exec batala-vitrine-app-1 node -e "
  const pg = require('pg');
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  pool.query('SELECT * FROM migrations_log ORDER BY applied_at')
    .then(r => console.table(r.rows))
    .finally(() => pool.end());
"
```
