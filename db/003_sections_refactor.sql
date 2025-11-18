-- ======================================
--  REFACTOR: Système de sections modulaires
--  Migration de blocks/cards vers sections/content
-- ======================================

-- ===============================
--  SECTIONS (remplace blocks)
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    
    -- TYPE DE SECTION
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'hero',         -- Grande bannière en haut de page
        'content',      -- Texte + image (layout flexible)
        'card_grid',    -- Grille de cards (événements, services)
        'gallery',      -- Photos et vidéos
        'cta',          -- Call-to-action (bouton)
        'footer'        -- Footer (singleton comme header)
    )),
    
    -- MÉTADONNÉES
    title VARCHAR(255),                      -- Titre de la section (affiché ou admin seulement)
    position INT DEFAULT 0,                  -- Ordre d'affichage
    is_visible BOOLEAN DEFAULT TRUE,         -- Masquer sans supprimer
    
    -- STYLE DE FOND
    bg_color VARCHAR(7),                     -- Couleur de fond (#hexadecimal)
    bg_image VARCHAR(512),                   -- Image de fond
    bg_video VARCHAR(512),                   -- Vidéo de fond (MP4)
    is_transparent BOOLEAN DEFAULT FALSE,    -- Fond transparent (laisse voir bg global)
    
    -- LAYOUT (selon type)
    layout VARCHAR(50),                      -- 'image_left' | 'image_right' | 'centered' | 'grid_2' | 'grid_3' | 'masonry'
    
    -- SPACING (padding vertical)
    padding_top VARCHAR(20) DEFAULT 'medium' CHECK (padding_top IN ('none', 'small', 'medium', 'large')),
    padding_bottom VARCHAR(20) DEFAULT 'medium' CHECK (padding_bottom IN ('none', 'small', 'medium', 'large')),
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_type ON sections(type);
CREATE INDEX idx_sections_position ON sections(position);

-- ===============================
--  SECTION_CONTENT (contenu spécifique par section)
-- ===============================
CREATE TABLE section_content (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    
    -- TEXTE
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    cta_label VARCHAR(100),                  -- Label du bouton CTA
    cta_url VARCHAR(512),                    -- URL du bouton CTA
    
    -- MEDIA
    media_url VARCHAR(512),                  -- Chemin vers image/vidéo
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'youtube')),
    media_alt TEXT,                          -- Alt text pour accessibilité
    media_size VARCHAR(20) DEFAULT 'medium' CHECK (media_size IN ('small', 'medium', 'large')),
    
    -- STYLE DU CONTENU
    text_color VARCHAR(7),                   -- Couleur du texte
    text_align VARCHAR(20) DEFAULT 'left' CHECK (text_align IN ('left', 'center', 'right')),
    bg_color VARCHAR(7),                     -- Couleur de fond du contenu (pour cards)
    
    -- POSITION (pour sections multi-contenu comme card_grid)
    position INT DEFAULT 0,
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_section_content_section_id ON section_content(section_id);
CREATE INDEX idx_section_content_position ON section_content(position);

-- ===============================
--  DECORATIONS (bibliothèque d'ornements)
-- ===============================
CREATE TABLE decorations (
    id SERIAL PRIMARY KEY,
    
    -- IDENTITÉ
    name VARCHAR(100) NOT NULL UNIQUE,       -- 'photo_corners', 'watercolor_splash', etc.
    display_name VARCHAR(100) NOT NULL,      -- "Coins photo", "Éclaboussure aquarelle"
    type VARCHAR(50) NOT NULL CHECK (type IN ('corner', 'overlay', 'frame', 'pattern')),
    description TEXT,                        -- Description pour l'admin UI
    
    -- SVG (stocké inline pour customisation couleur)
    svg_code TEXT NOT NULL,                  -- SVG complet avec viewBox
    
    -- STYLE PAR DÉFAUT
    default_color VARCHAR(7) DEFAULT '#e74c3c',
    default_opacity DECIMAL(3,2) DEFAULT 0.8 CHECK (default_opacity >= 0 AND default_opacity <= 1),
    default_scale DECIMAL(3,2) DEFAULT 1.0 CHECK (default_scale > 0),
    
    -- POSITIONS SUPPORTÉES (JSON array)
    supported_positions TEXT DEFAULT '["top-left","top-right","bottom-left","bottom-right"]',
    
    -- PREVIEW
    preview_url VARCHAR(512),                -- Image preview pour la sélection admin
    
    -- ACTIVATION
    is_active BOOLEAN DEFAULT TRUE,
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decorations_type ON decorations(type);
CREATE INDEX idx_decorations_active ON decorations(is_active);

-- ===============================
--  SECTION_DECORATIONS (many-to-many)
-- ===============================
CREATE TABLE section_decorations (
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    decoration_id INT NOT NULL REFERENCES decorations(id) ON DELETE CASCADE,
    
    -- CUSTOMIZATION PAR INSTANCE
    color VARCHAR(7),                        -- Override de la couleur par défaut
    opacity DECIMAL(3,2) DEFAULT 0.8 CHECK (opacity >= 0 AND opacity <= 1),
    scale DECIMAL(3,2) DEFAULT 1.0 CHECK (scale > 0 AND scale <= 3.0),
    position VARCHAR(50) DEFAULT 'top-left' CHECK (position IN (
        'top-left', 'top-right', 'bottom-left', 'bottom-right', 
        'center', 'top', 'bottom', 'left', 'right', 'full'
    )),
    
    -- Z-INDEX (si plusieurs décos sur même section)
    z_index INT DEFAULT 1,
    
    PRIMARY KEY (section_id, decoration_id, position)  -- Permet plusieurs décos, pas même position
);

CREATE INDEX idx_section_decorations_section ON section_decorations(section_id);
CREATE INDEX idx_section_decorations_decoration ON section_decorations(decoration_id);

-- ===============================
--  CARDS REFACTORÉ (simplifié, lié à section_id)
-- ===============================
-- Note: On garde une table cards mais simplifiée, liée à sections au lieu de blocks
CREATE TABLE cards_v2 (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    
    -- CONTENU
    title VARCHAR(255),
    description TEXT,
    
    -- MEDIA
    media_url VARCHAR(512),
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'photo', 'youtube')),
    link_url VARCHAR(512),                   -- URL externe ou vers page
    
    -- STYLE PAR CARD
    bg_color VARCHAR(7),
    text_color VARCHAR(7),
    
    -- EVENT (optionnel)
    event_date TIMESTAMP,
    
    -- POSITION
    position INT DEFAULT 0,
    
    -- TIMESTAMPS
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cards_v2_section_id ON cards_v2(section_id);
CREATE INDEX idx_cards_v2_position ON cards_v2(position);
CREATE INDEX idx_cards_v2_event_date ON cards_v2(event_date);

-- ===============================
--  TABLE PAGE (ajouts pour vidéo background)
-- ===============================
ALTER TABLE page ADD COLUMN IF NOT EXISTS main_bg_video VARCHAR(512);
ALTER TABLE page ADD COLUMN IF NOT EXISTS header_bg_video VARCHAR(512);

-- ===============================
--  TRIGGER: Updated_at automatique
-- ===============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_content_updated_at BEFORE UPDATE ON section_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_v2_updated_at BEFORE UPDATE ON cards_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================
--  COMMENTAIRES
-- ===============================
COMMENT ON TABLE sections IS 'Sections modulaires remplaçant les blocks. Chaque section a un type et des propriétés de style.';
COMMENT ON TABLE section_content IS 'Contenu spécifique pour chaque section. Une section hero a 1 content, une card_grid en a plusieurs.';
COMMENT ON TABLE decorations IS 'Bibliothèque réutilisable d''ornements SVG (coins photo, vagues, etc.)';
COMMENT ON TABLE section_decorations IS 'Association sections ↔ decorations avec customisation (couleur, position, opacité)';
COMMENT ON TABLE cards_v2 IS 'Cards simplifiées liées aux sections de type card_grid ou gallery';
