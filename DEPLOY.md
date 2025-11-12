# 🚀 Guide de Déploiement CI/CD - NAS Synology

## 📋 Prérequis

- Synology DS224+ avec Docker installé
- Compte Docker Hub
- Certificat SSL configuré sur le NAS (Let's Encrypt)
- Accès SSH au NAS

---

## 🔧 Configuration Initiale

### 1. Sur Docker Hub

```bash
# Créer un repository (depuis le site web)
# Repository: your-username/batala-vitrine
# Visibility: Public ou Private

# Créer un Personal Access Token
# Settings > Security > New Access Token
# Name: github-actions
# Permissions: Read, Write, Delete
# ⚠️ Copier le token, il ne sera plus affiché
```

### 2. Sur GitHub

#### Ajouter les secrets dans le repository

`Settings > Secrets and variables > Actions > New repository secret`

| Secret Name | Valeur | Description |
|-------------|--------|-------------|
| `DOCKER_USERNAME` | `your-username` | Username Docker Hub |
| `DOCKER_TOKEN` | `dckr_pat_...` | Token d'accès Docker Hub |
| `NAS_HOST` | `nas.votredomaine.fr` | Hostname ou IP du NAS |
| `NAS_USER` | `admin` | Utilisateur SSH (avec droits Docker) |
| `NAS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Clé privée SSH |
| `NAS_SSH_PORT` | `22` | Port SSH (défaut: 22) |
| `NAS_APP_URL` | `https://batala.votredomaine.fr` | URL publique de l'app |

### 3. Configurer SSH pour GitHub Actions

```bash
# Sur votre machine locale, générer une paire de clés SSH
ssh-keygen -t ed25519 -C "github-actions-batala" -f ~/.ssh/github_actions_batala
# Ne pas mettre de passphrase (appuyer sur Entrée)

# Copier la clé publique sur le NAS
ssh-copy-id -i ~/.ssh/github_actions_batala.pub admin@nas.votredomaine.fr

# Afficher la clé privée pour la copier dans GitHub
cat ~/.ssh/github_actions_batala
# Copier TOUT le contenu (y compris BEGIN/END)
```

### 4. Sur le NAS (via SSH)

```bash
# Se connecter au NAS
ssh admin@nas.votredomaine.fr

# Créer le dossier du projet
sudo mkdir -p /volume1/docker/batala-vitrine
cd /volume1/docker/batala-vitrine

# Créer le fichier .env
cat > .env << 'EOF'
# Docker Image
DOCKER_IMAGE=your-dockerhub-username/batala-vitrine:latest

# Application
NODE_ENV=production
APP_PORT=3000

# Database
DB_USER=batala_user
DB_PASSWORD=ChangeMe123!SecurePassword
DB_NAME=batala_vitrine

# JWT Secrets (générer manuellement des chaînes base64)
# Vous pouvez utiliser: https://generate-random.org/base64-string-generator
# ou depuis Node.js: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
JWT_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here
EOF

echo ""
echo "⚠️  IMPORTANT: Éditez le fichier .env et remplacez JWT_SECRET et JWT_REFRESH_SECRET"
echo "   par des valeurs aléatoires (32+ caractères en base64)"

# Créer le docker-compose.prod.yml
# Copier le contenu depuis le repo GitHub ou créer directement :
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  app:
    image: ${DOCKER_IMAGE:-your-dockerhub-username/batala-vitrine:latest}
    container_name: batala-vitrine-app
    restart: unless-stopped
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - batala-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:16-alpine
    container_name: batala-vitrine-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    # Pas de volume persistant pour permettre réinitialisation facile
    # Les scripts SQL sont dans l'image app, exécutés au démarrage
    networks:
      - batala-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  batala-network:
    driver: bridge
EOF

# Créer le script de déploiement
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

# Ajouter les chemins Docker Synology
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

PROJECT_DIR="/volume1/docker/batala-vitrine"
IMAGE="${DOCKER_IMAGE:-iousco/batala-vitrine:latest}"

echo "🚀 Déploiement Batala Vitrine"
echo "📦 Image: $IMAGE"

cd "$PROJECT_DIR"

# Pull la dernière image
echo "📥 Pull de l'image Docker..."
docker pull "$IMAGE"

# Arrêter et supprimer les anciens conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose down

# Démarrer les nouveaux conteneurs
echo "🔄 Démarrage des conteneurs..."
docker-compose up -d

# Attendre que l'app soit prête
echo "⏳ Attente du démarrage..."
sleep 10

# Health check
echo "🏥 Vérification de la santé..."
for i in {1..10}; do
  if docker exec batala-vitrine-app node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"; then
    echo "✅ Déploiement réussi!"
    echo ""
    echo "📋 Logs récents:"
    docker-compose logs --tail=20 app
    exit 0
  fi
  echo "⏳ Tentative $i/10..."
  sleep 3
done

echo "❌ Le déploiement a échoué (health check timeout)"
echo "📋 Logs d'erreur:"
docker-compose logs --tail=50 app
exit 1
EOF

# Rendre le script exécutable
chmod +x deploy.sh

# Test manuel du déploiement
./deploy.sh
```

### 5. Configurer Reverse Proxy (Synology DSM)

#### Dans `Panneau de configuration > Portail d'application > Reverse Proxy`

**Proxy : Application**
- Nom : `Batala Vitrine App`
- Source :
  - Protocole : HTTPS
  - Nom d'hôte : `batala.votredomaine.fr`
  - Port : 443
  - Certificat : Sélectionner votre certificat Let's Encrypt
- Destination :
  - Protocole : HTTP
  - Nom d'hôte : `localhost`
  - Port : `3000`

---

## 🔄 Workflow de Déploiement

### Déploiement Automatique

```bash
# Sur votre machine locale
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# GitHub Actions va automatiquement :
# 1. Lancer les tests ✅
# 2. Build l'image Docker 🐳
# 3. Push sur Docker Hub 📦
# 4. Se connecter en SSH au NAS 🔐
# 5. Exécuter deploy.sh sur le NAS 🚀
```

### Déploiement Manuel

```bash
# Sur le NAS
cd /volume1/docker/batala-vitrine
./deploy.sh
```

### Réinitialiser la Base de Données

```bash
# Sur le NAS
cd /volume1/docker/batala-vitrine
docker-compose down
# La DB sera réinitialisée au prochain démarrage
docker-compose up -d
```

---

## 🔍 Vérifications et Monitoring

### Health Checks

```bash
# Application
curl https://batala.votredomaine.fr/health

# Logs
ssh admin@nas.votredomaine.fr
cd /volume1/docker/batala-vitrine
docker-compose logs -f app
docker-compose logs -f db
```

### Commandes Utiles

```bash
# Sur le NAS via SSH
ssh admin@nas.votredomaine.fr
cd /volume1/docker/batala-vitrine

# Voir les conteneurs actifs
docker ps

# Redémarrer l'application
docker-compose restart app

# Voir l'utilisation des ressources
docker stats batala-vitrine-app batala-vitrine-db

# Nettoyer les anciennes images
docker image prune -a -f

# Voir les logs en temps réel
docker-compose logs -f
```

---

## 🛡️ Sécurité

### Pare-feu NAS

1. `Panneau de configuration > Sécurité > Pare-feu`
2. Créer une règle :
   - Autoriser ports : 443 (HTTPS), 9000 (Webhook)
   - Refuser tout le reste depuis Internet
   - Autoriser réseau local complet

### Certificat SSL

Le certificat Let's Encrypt se renouvelle automatiquement via DSM.

### Secrets

⚠️ **Ne jamais commiter** :
- `.env`
- `.env.webhook`
- Tokens Docker Hub
- Secrets JWT

---

## 🐛 Troubleshooting

### L'app ne démarre pas

```bash
# Vérifier les logs
docker-compose logs app

# Vérifier la DB
docker-compose exec db psql -U batala_user -d batala_vitrine -c "\dt"

# Redémarrer proprement
docker-compose down
docker-compose up -d
```

### GitHub Actions ne peut pas se connecter en SSH

```bash
# Sur votre machine locale
# Vérifier que la clé publique est bien sur le NAS
ssh -i ~/.ssh/github_actions_batala admin@nas.votredomaine.fr

# Si ça marche, vérifier que la clé privée est bien dans GitHub
# Settings > Secrets > NAS_SSH_KEY (doit contenir BEGIN/END PRIVATE KEY)
```

### GitHub Actions échoue

1. Vérifier les secrets dans GitHub
2. Vérifier les logs dans Actions tab
3. Tester le build local :
   ```bash
   docker build -t test .
   docker run -p 3000:3000 test
   ```

---

## 📊 Monitoring (Optionnel)

### Uptime Kuma (sur NAS)

```bash
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v /volume1/docker/uptime-kuma:/app/data \
  --restart unless-stopped \
  louislam/uptime-kuma:1

# Accès: http://nas-ip:3001
# Configurer monitoring de: https://batala.votredomaine.fr/health
```

---

## 🎯 Checklist de Déploiement Initial

- [ ] Docker Hub repository créé
- [ ] Token Docker Hub généré
- [ ] Paire de clés SSH générée (ed25519)
- [ ] Clé publique copiée sur le NAS (`ssh-copy-id`)
- [ ] Secrets GitHub configurés (DOCKER_USERNAME, DOCKER_TOKEN, NAS_*, etc.)
- [ ] Dossier NAS créé (/volume1/docker/batala-vitrine)
- [ ] 3 fichiers créés sur NAS (.env, docker-compose.prod.yml, deploy.sh)
- [ ] Script deploy.sh rendu exécutable (chmod +x)
- [ ] Reverse proxy configuré (1 proxy HTTPS)
- [ ] Certificat SSL activé
- [ ] Pare-feu configuré (port 22 SSH + 443 HTTPS)
- [ ] Test déploiement manuel réussi (`./deploy.sh`)
- [ ] Test connexion SSH GitHub Actions (git push déclenche déploiement)

---

## 📝 Notes

- **Base de données** : Pas de volume persistant pour faciliter les réinitialisations
- **Images Docker** : Pull depuis Docker Hub uniquement (pas de code source sur NAS)
- **Logs** : Conservés dans `/volume1/docker/batala-vitrine/logs/`
- **Fichiers sur NAS** : Seulement 4 fichiers de config (pas de repo Git)
- **Backups** : À configurer si nécessaire (Hyper Backup)

---

**Besoin d'aide ?** Consulter les logs en premier :
```bash
docker-compose logs --tail=100 app
```

---

## 📁 Structure sur NAS

```
/volume1/docker/batala-vitrine/
├── .env                      # Variables d'environnement
├── docker-compose.prod.yml   # Stack Docker (SANS volume DB)
└── deploy.sh                 # Script de déploiement
```

**Seulement 3 fichiers !** Pas de code source, uniquement la configuration. L'image Docker contient tout le code.
