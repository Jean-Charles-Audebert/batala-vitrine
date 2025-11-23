-- ======================================
--  Schema: Batala Vitrine WMS (from scratch)
--  Date: 2025-11-23
-- ======================================

-- Drops (en dev)
DROP TABLE IF EXISTS elements CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS page CASCADE;
DROP TABLE IF EXISTS fonts CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;

-- ===============================
-- ADMINS
-- ===============================
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);

-- ===============================
-- REFRESH TOKENS
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
-- FONTS
-- ===============================
CREATE TABLE fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('google', 'upload', 'system')),
    url VARCHAR(1024),
    font_family VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fonts_source ON fonts(source);

-- ===============================
-- PAGE (singleton pour thème global)
-- ===============================
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Mon Site',
    title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
    text_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
    contact_email VARCHAR(255)
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- SECTIONS (containers d'éléments)
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    show_title BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    position INT DEFAULT 0,
    layout JSONB, -- configuration de la grille / positions des éléments
    settings JSONB, -- paramètres généraux (bg_color, bg_image, bg_video, padding, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_position ON sections(position);

-- ===============================
-- ELEMENTS (texte, media, card, photo, video)
-- ===============================
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'media', 'card', 'photo', 'video')),
    title VARCHAR(255),
    position INT DEFAULT 0,
    settings JSONB, -- paramètres spécifiques (taille, couleur, url, alignment, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_elements_section_id ON elements(section_id);
CREATE INDEX idx_elements_position ON elements(position);

-- ===============================
-- TRIGGERS: updated_at
-- ===============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elements_updated_at
BEFORE UPDATE ON elements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_updated_at
BEFORE UPDATE ON page
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
