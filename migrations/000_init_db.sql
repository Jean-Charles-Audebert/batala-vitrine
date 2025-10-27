-- Script d'initialisation de la base de données
-- À exécuter en tant que superuser postgres

-- Créer la base de données si elle n'existe pas
SELECT 'CREATE DATABASE batala_vitrine'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'batala_vitrine')\gexec

-- Créer l'utilisateur si nécessaire (optionnel)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'batala') THEN
      CREATE USER batala WITH PASSWORD 'batala_password';
   END IF;
END
$do$;

-- Accorder les privilèges
GRANT ALL PRIVILEGES ON DATABASE batala_vitrine TO batala;
