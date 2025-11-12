-- Migration: Simplification de la gestion des polices
-- Date: 2025-11-12
-- Description: Table fonts pour gérer une bibliothèque + simplification page pour une seule police globale

-- Table pour stocker la bibliothèque de polices
CREATE TABLE IF NOT EXISTS fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('google', 'upload', 'system')),
    url VARCHAR(1024),
    font_family VARCHAR(512) NOT NULL,
    file_path VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fonts_source ON fonts(source);

-- Insérer les polices système par défaut
INSERT INTO fonts (name, source, font_family) VALUES
('Arial', 'system', 'Arial, sans-serif'),
('Helvetica', 'system', '''Helvetica Neue'', Helvetica, sans-serif'),
('Segoe UI', 'system', '''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif'),
('Georgia', 'system', 'Georgia, serif'),
('Times New Roman', 'system', '''Times New Roman'', Times, serif'),
('Verdana', 'system', 'Verdana, sans-serif')
ON CONFLICT (name) DO NOTHING;

-- Simplifier la table page : une seule police pour tous les titres
ALTER TABLE page DROP COLUMN IF EXISTS header_title_font;
ALTER TABLE page DROP COLUMN IF EXISTS main_title_font;
ALTER TABLE page DROP COLUMN IF EXISTS custom_header_font;
ALTER TABLE page DROP COLUMN IF EXISTS custom_main_font;
ALTER TABLE page DROP COLUMN IF EXISTS custom_header_font_url;
ALTER TABLE page DROP COLUMN IF EXISTS custom_main_font_url;

-- Ajouter une seule référence vers la table fonts
ALTER TABLE page ADD COLUMN IF NOT EXISTS title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL;

-- Par défaut, utiliser Arial (id=1)
UPDATE page SET title_font_id = 1 WHERE id = 1 AND title_font_id IS NULL;

COMMENT ON TABLE fonts IS 'Bibliothèque de polices (système, Google Fonts, uploads)';
COMMENT ON COLUMN page.title_font_id IS 'Police utilisée pour TOUS les titres du site (h1-h6)';
