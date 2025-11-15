-- Migration: Ajout du type de média pour les cartes
-- Date: 2025-11-13
-- Description: Ajoute un champ media_type pour distinguer images, photos et vidéos YouTube

ALTER TABLE cards ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';

-- Types possibles:
-- 'image' : image standard (events, offers)
-- 'photo' : photo du bloc photos
-- 'youtube' : vidéo YouTube

COMMENT ON COLUMN cards.media_type IS 'Type de média: image, photo, youtube';
