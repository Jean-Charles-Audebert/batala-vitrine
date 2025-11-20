-- ======================================
--  Schema: Batala Vitrine WMS (consolidé)
--  Inclut toutes les migrations fusionnées
-- ======================================

-- Drops (facultatifs en dev)
DROP TABLE IF EXISTS hero_nav_links CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS section_decorations CASCADE;
DROP TABLE IF EXISTS decorations CASCADE;
DROP TABLE IF EXISTS cards_v2 CASCADE;
DROP TABLE IF EXISTS section_content CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS footer_elements CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS fonts CASCADE;
DROP TABLE IF EXISTS page CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ===============================
--  ADMINS
-- ===============================
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);

-- ===============================
--  REFRESH TOKENS
-- ===============================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_admin_id ON refresh_tokens(admin_id);

-- ===============================
--  FONTS (bibliothèque de polices)
-- ===============================
CREATE TABLE fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('google', 'upload', 'system')),
    url VARCHAR(1024),
    font_family VARCHAR(512) NOT NULL,
    file_path VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fonts_source ON fonts(source);

-- ===============================
--  PAGE (singleton pour thème global)
-- ===============================
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Mon Site',

    -- HEADER THEME
    header_bg_image VARCHAR(512),
    header_bg_color VARCHAR(7) DEFAULT '#ffffff',
    header_title_color VARCHAR(7) DEFAULT '#ffffff',

    -- MAIN CONTENT THEME (zone entre header et footer)
    main_bg_image VARCHAR(512),
    main_bg_color VARCHAR(7) DEFAULT '#f5f5f5',
    main_title_color VARCHAR(7) DEFAULT '#333333',

    -- FOOTER THEME
    footer_bg_image VARCHAR(512),
    footer_bg_color VARCHAR(7) DEFAULT '#2c3e50',
    footer_text_color VARCHAR(7) DEFAULT '#ecf0f1',

    -- POLICE GLOBALE (référence vers table fonts)
    title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,

    -- Support vidéo background
    main_bg_video VARCHAR(512),
    header_bg_video VARCHAR(512),

    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
--  BLOCKS
-- ===============================
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    style JSONB DEFAULT '{}',
    position INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_collapsible BOOLEAN DEFAULT FALSE,
    bg_image VARCHAR(512),
    header_logo VARCHAR(512),
    header_title VARCHAR(255),
    is_fixed BOOLEAN DEFAULT FALSE,

    -- BLOCK THEME CUSTOMIZATION
    is_transparent BOOLEAN DEFAULT FALSE,
    bg_color VARCHAR(7),
    title_font VARCHAR(255),
    title_color VARCHAR(7),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blocks_position ON blocks(position);
CREATE INDEX idx_blocks_slug ON blocks(slug);

-- ===============================
--  CARDS (template réutilisable)
-- ===============================
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    block_id INT NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    position INT NOT NULL,
    template VARCHAR(50) DEFAULT 'default', -- 'default', 'image_left', 'image_right', 'photo', 'video', 'text_only'
    title VARCHAR(255), -- nullable pour galeries photos/vidéos
    description TEXT,
    media_path VARCHAR(512),
    media_type VARCHAR(20) DEFAULT 'image', -- 'image', 'photo', 'youtube'
    style JSONB DEFAULT '{}',
    event_date DATE,

    -- CARD THEME CUSTOMIZATION
    bg_color VARCHAR(7),
    title_color VARCHAR(7),
    description_color VARCHAR(7),
    description_bg_color VARCHAR(7) DEFAULT '#ffffff',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cards_block_id ON cards(block_id);
CREATE INDEX idx_cards_position ON cards(position);

-- ===============================
--  FOOTER ELEMENTS
-- ===============================
CREATE TABLE footer_elements (
    id SERIAL PRIMARY KEY,
    block_id INT NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    position INT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_footer_elements_block_id ON footer_elements(block_id);
CREATE INDEX idx_footer_elements_position ON footer_elements(position);

-- ===============================
--  SECTIONS (système modulaire v2)
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hero', 'content', 'card_grid', 'gallery', 'cta', 'footer')),
    title VARCHAR(255),
    position INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    bg_color VARCHAR(7),
    bg_image VARCHAR(512),
    bg_video VARCHAR(512),
    bg_youtube VARCHAR(512),
    is_transparent BOOLEAN DEFAULT FALSE,
    layout VARCHAR(50),
    padding_top VARCHAR(20) DEFAULT 'medium' CHECK (padding_top IN ('none', 'small', 'medium', 'large')),
    padding_bottom VARCHAR(20) DEFAULT 'medium' CHECK (padding_bottom IN ('none', 'small', 'medium', 'large')),

    -- Colonnes header ajoutées (migration 004)
    logo_url VARCHAR(512),
    logo_position_h VARCHAR(20) DEFAULT 'center' CHECK (logo_position_h IN ('left', 'center', 'right')),
    logo_position_v VARCHAR(20) DEFAULT 'center' CHECK (logo_position_v IN ('top', 'center', 'bottom')),
    logo_width INT DEFAULT 150, -- Largeur en pixels
    show_social_links BOOLEAN DEFAULT FALSE,
    social_position_h VARCHAR(20) DEFAULT 'right' CHECK (social_position_h IN ('left', 'center', 'right')),
    social_position_v VARCHAR(20) DEFAULT 'top' CHECK (social_position_v IN ('top', 'center', 'bottom')),
    social_icon_size INT DEFAULT 24, -- Taille icônes en pixels
    social_icon_color VARCHAR(7) DEFAULT '#ffffff',
    show_nav_links BOOLEAN DEFAULT FALSE,
    nav_position_h VARCHAR(20) DEFAULT 'right' CHECK (nav_position_h IN ('left', 'center', 'right')),
    nav_position_v VARCHAR(20) DEFAULT 'center' CHECK (nav_position_v IN ('top', 'center', 'bottom')),
    nav_text_color VARCHAR(7) DEFAULT '#ffffff',
    nav_bg_color VARCHAR(30) DEFAULT 'rgba(255,255,255,0.25)',
    is_sticky BOOLEAN DEFAULT FALSE, -- Header fixe au scroll

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_type ON sections(type);
CREATE INDEX idx_sections_position ON sections(position);

-- ===============================
--  SECTION_CONTENT
-- ===============================
CREATE TABLE section_content (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    cta_label VARCHAR(100),
    cta_url VARCHAR(512),
    media_url VARCHAR(512),
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'youtube')),
    media_alt TEXT,
    media_size VARCHAR(20) DEFAULT 'medium' CHECK (media_size IN ('small', 'medium', 'large')),
    text_color VARCHAR(7),
    text_align VARCHAR(20) DEFAULT 'left' CHECK (text_align IN ('left', 'center', 'right')),
    bg_color VARCHAR(7),
    position INT DEFAULT 0,

    -- Colonnes ajoutées (migration 004)
    title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
    title_color VARCHAR(7) DEFAULT '#ffffff',
    title_position_h VARCHAR(20) DEFAULT 'center' CHECK (title_position_h IN ('left', 'center', 'right')),
    title_position_v VARCHAR(20) DEFAULT 'center' CHECK (title_position_v IN ('top', 'center', 'bottom')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_section_content_section_id ON section_content(section_id);
CREATE INDEX idx_section_content_position ON section_content(position);

-- ===============================
--  DECORATIONS
-- ===============================
CREATE TABLE decorations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('corner', 'overlay', 'frame', 'pattern')),
    description TEXT,
    svg_code TEXT NOT NULL,
    default_color VARCHAR(7) DEFAULT '#e74c3c',
    default_opacity DECIMAL(3,2) DEFAULT 0.8 CHECK (default_opacity >= 0 AND default_opacity <= 1),
    default_scale DECIMAL(3,2) DEFAULT 1.0 CHECK (default_scale > 0),
    supported_positions TEXT DEFAULT '["top-left","top-right","bottom-left","bottom-right"]',
    preview_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decorations_type ON decorations(type);
CREATE INDEX idx_decorations_active ON decorations(is_active);

-- ===============================
--  SECTION_DECORATIONS
-- ===============================
CREATE TABLE section_decorations (
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    decoration_id INT NOT NULL REFERENCES decorations(id) ON DELETE CASCADE,
    color VARCHAR(7),
    opacity DECIMAL(3,2) DEFAULT 0.8 CHECK (opacity >= 0 AND opacity <= 1),
    scale DECIMAL(3,2) DEFAULT 1.0 CHECK (scale > 0 AND scale <= 3.0),
    position VARCHAR(50) DEFAULT 'top-left' CHECK (position IN (
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'center', 'top', 'bottom', 'left', 'right', 'full'
    )),
    z_index INT DEFAULT 1,
    PRIMARY KEY (section_id, decoration_id, position)
);

CREATE INDEX idx_section_decorations_section ON section_decorations(section_id);
CREATE INDEX idx_section_decorations_decoration ON section_decorations(decoration_id);

-- ===============================
--  CARDS_V2
-- ===============================
CREATE TABLE cards_v2 (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    media_url VARCHAR(512),
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'photo', 'youtube')),
    link_url VARCHAR(512),
    bg_color VARCHAR(7),
    text_color VARCHAR(7),
    event_date TIMESTAMP,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cards_v2_section_id ON cards_v2(section_id);
CREATE INDEX idx_cards_v2_position ON cards_v2(position);
CREATE INDEX idx_cards_v2_event_date ON cards_v2(event_date);

-- ===============================
--  SOCIAL_LINKS (migration 003)
-- ===============================
CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'github', 'website')),
    url VARCHAR(512) NOT NULL,
    label VARCHAR(100),
    icon_svg TEXT, -- SVG personnalisé optionnel
    position INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    location VARCHAR(20) DEFAULT 'footer' CHECK (location IN ('header', 'footer', 'both')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_social_links_location ON social_links(location);
CREATE INDEX idx_social_links_position ON social_links(position);

-- ===============================
--  HERO_NAV_LINKS (migration 004)
-- ===============================
CREATE TABLE hero_nav_links (
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
--  TRIGGERS: Updated_at
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

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_nav_links_updated_at BEFORE UPDATE ON hero_nav_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();</content>
<parameter name="filePath">c:\Workspaces\Perso\batala-vitrine\db\schema.sql