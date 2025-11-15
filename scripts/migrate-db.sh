#!/bin/bash
set -e

# Script pour appliquer toutes les migrations SQL à la base de données
# Usage: ./migrate-db.sh [DB_HOST]

DB_HOST="${1:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-batala_vitrine}"
DB_USER="${DB_USER:-postgres}"

echo "🔄 Application des migrations SQL..."
echo "📍 Host: $DB_HOST"
echo "📦 Database: $DB_NAME"

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL..."
for i in {1..30}; do
  if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ PostgreSQL est prêt"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Timeout: PostgreSQL n'est pas accessible"
    exit 1
  fi
  echo "   Tentative $i/30..."
  sleep 2
done

# Créer la table de tracking des migrations si elle n'existe pas
echo "📋 Vérification de la table migrations_log..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<EOF
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_file VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

# Appliquer chaque migration dans l'ordre
MIGRATIONS_DIR="/app/db"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  MIGRATIONS_DIR="./db"
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "❌ Répertoire migrations introuvable: $MIGRATIONS_DIR"
  exit 1
fi

echo "📂 Répertoire migrations: $MIGRATIONS_DIR"

for migration_file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  filename=$(basename "$migration_file")
  
  # Vérifier si la migration a déjà été appliquée
  already_applied=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT COUNT(*) FROM migrations_log WHERE migration_file = '$filename'")
  
  if [ "$already_applied" -eq "0" ]; then
    echo "▶️  Application: $filename"
    
    # Appliquer la migration
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"; then
      # Enregistrer dans le log
      PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
        "INSERT INTO migrations_log (migration_file) VALUES ('$filename')"
      echo "   ✅ $filename appliquée avec succès"
    else
      echo "   ❌ Erreur lors de l'application de $filename"
      exit 1
    fi
  else
    echo "⏭️  Ignoré (déjà appliqué): $filename"
  fi
done

echo ""
echo "✅ Toutes les migrations sont à jour!"
echo ""
echo "📊 Migrations appliquées:"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c \
  "SELECT migration_file, applied_at FROM migrations_log ORDER BY applied_at"
