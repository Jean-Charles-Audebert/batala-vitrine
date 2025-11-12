-- Migration: Ajout des URLs pour importer des polices personnalisées
-- Date: 2025-11-12
-- Description: Permet aux utilisateurs d'importer des polices Google Fonts ou autres via URL

ALTER TABLE page ADD COLUMN IF NOT EXISTS custom_header_font_url VARCHAR(1024);
ALTER TABLE page ADD COLUMN IF NOT EXISTS custom_main_font_url VARCHAR(1024);

COMMENT ON COLUMN page.custom_header_font_url IS 'URL pour importer la police du header (ex: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700")';
COMMENT ON COLUMN page.custom_main_font_url IS 'URL pour importer la police du contenu principal (ex: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600")';
