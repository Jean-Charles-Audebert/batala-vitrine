-- Migration 008: Rendre le champ title nullable dans cards
-- Date: 2025-11-15
-- Description: Permet de créer des cartes sans titre (utile pour les galeries photos/vidéos)

ALTER TABLE cards ALTER COLUMN title DROP NOT NULL;

