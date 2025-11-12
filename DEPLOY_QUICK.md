# 🚀 Déploiement Rapide

## Workflow Actuel (Semi-automatique)

### 1. Push vers GitHub → Build automatique

```bash
git add .
git commit -m "feat: votre message"
git push
```

✅ **GitHub Actions va automatiquement** :
- Lancer les tests (Jest + ESLint)
- Builder l'image Docker
- Pousser sur Docker Hub : `iousco/batala-vitrine:latest`

### 2. Déploiement manuel sur le NAS

```bash
# Se connecter au NAS
ssh admin@nas.votredomaine.fr

# Lancer le déploiement
cd /volume1/docker/batala-vitrine
./deploy.sh
```

✅ **Le script va** :
- Pull la dernière image depuis Docker Hub
- Arrêter les anciens conteneurs
- Démarrer les nouveaux conteneurs
- Vérifier la santé de l'application
- Afficher les logs récents

## 🔍 Vérifications Post-Déploiement

```bash
# Vérifier les conteneurs actifs
docker ps

# Voir les logs
docker logs batala-vitrine-app --tail=50
docker logs batala-vitrine-db --tail=30

# Tester l'API health
curl https://batala.jc1932.synology.me/health

# Tester l'accès web
# Ouvrir dans le navigateur : https://batala.jc1932.synology.me/
```

## 🔐 Login Admin

- **Email** : `admin@batala.fr`
- **Mot de passe** : `SecureP@ss123`

(Défini dans `db/002_seed.sql`)

## 📝 Variables d'Environnement

Le fichier `.env` sur le NAS contient :

```bash
DOCKER_IMAGE=iousco/batala-vitrine:latest
NODE_ENV=production
APP_PORT=3000
DB_USER=batala_user
DB_PASSWORD=BatalaP@ssword321
DB_NAME=batala_vitrine
JWT_SECRET=bU9KRjgtQzBCbE1WQzRHeEVvZHY5YjZMNkltNFR3NUc=
JWT_REFRESH_SECRET=M1Y4UzN5dG5KflFPTmUwRGJJTkt6XzczT2Y0N2ZVQ20=
```

## 🐛 Troubleshooting

### L'application ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs -f app

# Vérifier la DB
docker-compose logs -f db

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

### Réinitialiser la base de données

```bash
cd /volume1/docker/batala-vitrine
docker-compose down
docker volume rm batala-vitrine_db-data 2>/dev/null || true
docker-compose up -d
```

### Port 3000 déjà utilisé

```bash
# Voir quel process utilise le port
sudo netstat -tlnp | grep :3000

# Arrêter le conteneur qui utilise le port
docker stop <container_name>
```

## 📊 Structure des Fichiers sur le NAS

```
/volume1/docker/batala-vitrine/
├── .env                      # Variables d'environnement
├── docker-compose.prod.yml   # Stack Docker
└── deploy.sh                 # Script de déploiement
```

**Important** : Pas de code source sur le NAS ! Tout est dans l'image Docker.

## 🔄 Workflow Futur (Déploiement SSH Automatique)

Une fois le problème de PATH Docker résolu sur Synology, on pourra réactiver le job `deploy-to-nas` dans `.github/workflows/deploy.yml` pour un déploiement 100% automatique.

Pour cela, on pourra s'inspirer de votre autre projet qui fonctionne déjà.
