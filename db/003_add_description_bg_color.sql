-- Migration: Ajout de description_bg_color dans la table cards
-- Date: 2025-11-12

ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS description_bg_color VARCHAR(7) DEFAULT '#ffffff';

COMMENT ON COLUMN cards.description_bg_color IS 'Couleur de fond de la zone description de la carte';
