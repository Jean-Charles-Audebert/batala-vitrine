-- Migration 010: Retirer media_path_original (convention de nommage -optimized à la place)
-- Date: 2025-11-15
-- Description: Simplifie la gestion des images - on utilise une convention de nommage pour les fichiers optimisés

ALTER TABLE cards DROP COLUMN IF EXISTS media_path_original;
