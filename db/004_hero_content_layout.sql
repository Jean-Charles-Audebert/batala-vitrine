-- Migration: Amélioration layout hero avec logo, social et navigation
-- Date: 2025-11-19
-- Objectif: Permettre positionnement flexible de tous les éléments du header
-- Run: psql -h localhost -p 5432 -U batala_dev -d batala_vitrine_db -f db/004_hero_content_layout.sql

-- ===============================
--  SECTIONS: Ajout colonnes header
-- ===============================
ALTER TABLE sections 
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(512),
ADD COLUMN IF NOT EXISTS logo_position_h VARCHAR(20) DEFAULT 'center' CHECK (logo_position_h IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS logo_position_v VARCHAR(20) DEFAULT 'center' CHECK (logo_position_v IN ('top', 'center', 'bottom')),
ADD COLUMN IF NOT EXISTS logo_width INT DEFAULT 150, -- Largeur en pixels
ADD COLUMN IF NOT EXISTS show_social_links BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS social_position_h VARCHAR(20) DEFAULT 'right' CHECK (social_position_h IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS social_position_v VARCHAR(20) DEFAULT 'top' CHECK (social_position_v IN ('top', 'center', 'bottom')),
ADD COLUMN IF NOT EXISTS social_icon_size INT DEFAULT 24, -- Taille icônes en pixels
ADD COLUMN IF NOT EXISTS social_icon_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS show_nav_links BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nav_position_h VARCHAR(20) DEFAULT 'right' CHECK (nav_position_h IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS nav_position_v VARCHAR(20) DEFAULT 'center' CHECK (nav_position_v IN ('top', 'center', 'bottom')),
ADD COLUMN IF NOT EXISTS nav_text_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS nav_bg_color VARCHAR(30) DEFAULT 'rgba(255,255,255,0.25)',
ADD COLUMN IF NOT EXISTS is_sticky BOOLEAN DEFAULT FALSE; -- Header fixe au scroll

-- ===============================
--  SECTION_CONTENT: Ajout police personnalisée
-- ===============================
ALTER TABLE section_content
ADD COLUMN IF NOT EXISTS title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS title_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS title_position_h VARCHAR(20) DEFAULT 'center' CHECK (title_position_h IN ('left', 'center', 'right')),
ADD COLUMN IF NOT EXISTS title_position_v VARCHAR(20) DEFAULT 'center' CHECK (title_position_v IN ('top', 'center', 'bottom'));

-- ===============================
--  HERO_NAV_LINKS: Navigation vers sections
-- ===============================
CREATE TABLE IF NOT EXISTS hero_nav_links (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE, -- Section hero qui contient les liens
    target_section_id INT REFERENCES sections(id) ON DELETE CASCADE, -- Section cible
    label VARCHAR(100) NOT NULL, -- Texte du lien
    position INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hero_nav_links_section_id ON hero_nav_links(section_id);
CREATE INDEX idx_hero_nav_links_position ON hero_nav_links(position);

-- ===============================
--  SOCIAL_LINKS: Mise à jour pour header
-- ===============================
-- La table existe déjà (003_social_links.sql)
-- On peut réutiliser la colonne "location" avec valeur 'header' ou 'both'
UPDATE social_links SET location = 'both' WHERE id IN (SELECT id FROM social_links WHERE location = 'footer' ORDER BY position LIMIT 2);

-- Commentaires
COMMENT ON COLUMN sections.logo_position_h IS 'Position horizontale du logo: left, center, right';
COMMENT ON COLUMN sections.logo_position_v IS 'Position verticale du logo: top, center, bottom';
COMMENT ON COLUMN sections.social_position_h IS 'Position horizontale icônes sociales: left, center, right';
COMMENT ON COLUMN sections.social_position_v IS 'Position verticale icônes sociales: top, center, bottom';
COMMENT ON COLUMN sections.nav_position_h IS 'Position horizontale navigation: left, center, right';
COMMENT ON COLUMN sections.nav_position_v IS 'Position verticale navigation: top, center, bottom';
COMMENT ON COLUMN sections.is_sticky IS 'Header fixe au scroll (position: sticky)';
COMMENT ON TABLE hero_nav_links IS 'Liens de navigation affichés dans le hero vers autres sections';
