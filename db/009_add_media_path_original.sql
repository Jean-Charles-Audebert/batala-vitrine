-- Migration 009: Ajouter media_path_original pour stocker l'image non optimisée
-- Date: 2025-11-15
-- Description: Permet d'afficher l'image originale en plein écran tout en gardant la version optimisée pour les vignettes

ALTER TABLE cards ADD COLUMN media_path_original VARCHAR(512);

COMMENT ON COLUMN cards.media_path_original IS 'Chemin vers l''image originale non optimisée (pour affichage plein écran)';
