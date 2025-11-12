-- Migration: Ajout des champs pour polices personnalisées
-- Date: 2025-01-12
-- Description: Permet aux utilisateurs de saisir des polices personnalisées (Google Fonts, etc.)

ALTER TABLE page ADD COLUMN IF NOT EXISTS custom_header_font VARCHAR(512);
ALTER TABLE page ADD COLUMN IF NOT EXISTS custom_main_font VARCHAR(512);

COMMENT ON COLUMN page.custom_header_font IS 'Police personnalisée pour les titres du header (ex: "Roboto, sans-serif" ou "https://fonts.googleapis.com/css2?family=Roboto")';
COMMENT ON COLUMN page.custom_main_font IS 'Police personnalisée pour les titres du contenu principal (ex: "Montserrat, sans-serif")';
