#!/bin/bash
set -e

# Script de déploiement sur NAS Synology
# À placer dans /volume1/docker/batala-vitrine/ sur le NAS

PROJECT_DIR="/volume1/docker/batala-vitrine"
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE="${DOCKER_IMAGE:-your-dockerhub-username/batala-vitrine:latest}"

echo "🚀 Déploiement Batala Vitrine"
echo "📦 Image: $IMAGE"

cd "$PROJECT_DIR"

# Pull la dernière image
echo "📥 Pull de l'image Docker..."
docker pull "$IMAGE"

# Arrêter et supprimer les anciens conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose -f "$COMPOSE_FILE" down

# Optionnel: Supprimer la DB pour réinitialisation complète
# Décommenter si besoin de reset à chaque déploiement
# echo "🗑️  Suppression de la base de données..."
# docker volume rm batala-vitrine_db-data 2>/dev/null || true

# Démarrer les nouveaux conteneurs
echo "🔄 Démarrage des conteneurs..."
docker-compose -f "$COMPOSE_FILE" up -d

# Attendre que l'app soit prête
echo "⏳ Attente du démarrage..."
sleep 10

# Health check
echo "🏥 Vérification de la santé..."
for i in {1..10}; do
  if docker exec batala-vitrine-app node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"; then
    echo "✅ Déploiement réussi!"
    
    # Logs récents
    echo ""
    echo "📋 Logs récents:"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 app
    
    exit 0
  fi
  echo "⏳ Tentative $i/10..."
  sleep 3
done

echo "❌ Le déploiement a échoué (health check timeout)"
echo "📋 Logs d'erreur:"
docker-compose -f "$COMPOSE_FILE" logs --tail=50 app
exit 1
