-- Migration: Mise à jour de la table page vers le nouveau schéma
-- Date: 2025-11-23

-- Commencer une transaction
BEGIN;

-- Sauvegarder les données actuelles
CREATE TEMP TABLE page_backup AS SELECT * FROM page;

-- Supprimer les contraintes de clés étrangères temporaires
ALTER TABLE page DROP CONSTRAINT IF EXISTS page_title_font_id_fkey;

-- Renommer les colonnes existantes pour correspondre au nouveau schéma
ALTER TABLE page RENAME COLUMN main_bg_image TO main_bg_media_url;
ALTER TABLE page RENAME COLUMN main_bg_video TO main_bg_youtube_url;

-- Ajouter les nouvelles colonnes
ALTER TABLE page ADD COLUMN IF NOT EXISTS text_font_id INTEGER REFERENCES fonts(id) ON DELETE SET NULL;
ALTER TABLE page ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE page ADD COLUMN IF NOT EXISTS main_bg_opacity NUMERIC(3,2) DEFAULT 1.0;
ALTER TABLE page ADD COLUMN IF NOT EXISTS main_bg_position VARCHAR(50) DEFAULT 'center';

-- Supprimer les colonnes obsolètes (ancien système header/footer)
ALTER TABLE page DROP COLUMN IF EXISTS header_bg_image;
ALTER TABLE page DROP COLUMN IF EXISTS header_bg_color;
ALTER TABLE page DROP COLUMN IF EXISTS header_title_color;
ALTER TABLE page DROP COLUMN IF EXISTS main_title_color;
ALTER TABLE page DROP COLUMN IF EXISTS footer_bg_image;
ALTER TABLE page DROP COLUMN IF EXISTS footer_bg_color;
ALTER TABLE page DROP COLUMN IF EXISTS footer_text_color;
ALTER TABLE page DROP COLUMN IF EXISTS header_bg_video;

-- Recréer les contraintes de clés étrangères
ALTER TABLE page ADD CONSTRAINT page_title_font_id_fkey FOREIGN KEY (title_font_id) REFERENCES fonts(id) ON DELETE SET NULL;
ALTER TABLE page DROP CONSTRAINT IF EXISTS page_text_font_id_fkey;
ALTER TABLE page ADD CONSTRAINT page_text_font_id_fkey FOREIGN KEY (text_font_id) REFERENCES fonts(id) ON DELETE SET NULL;

-- Mettre à jour les valeurs par défaut
UPDATE page SET
  main_bg_opacity = 1.0,
  main_bg_position = 'center',
  contact_email = '',
  text_font_id = NULL
WHERE main_bg_opacity IS NULL;

-- Vérifier que la migration s'est bien passée
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM page;
  RAISE NOTICE 'Migration terminée. Nombre de lignes dans page: %', row_count;
END $$;

-- Valider la transaction
COMMIT;