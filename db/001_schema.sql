-- ======================================
--  Schema: Batala Vitrine WMS (from scratch)
--  Date: 2025-11-23
-- ======================================

-- Drops (en dev)
DROP TABLE IF EXISTS hero_nav_links CASCADE; -- obsolète, remplacé par elements de type 'link'
DROP TABLE IF EXISTS elements CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS page CASCADE;
DROP TABLE IF EXISTS fonts CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS social_links CASCADE;
DROP TABLE IF EXISTS nav_links CASCADE;

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
    variants JSONB DEFAULT '[]', -- Poids, styles, ex ["300", "400", "700 italic"]
    font_family VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fonts_source ON fonts(source);

-- ===============================
-- PAGE (singleton pour thème global)
-- ===============================
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Mon Site',
    default_font_title INT REFERENCES fonts(id) ON DELETE SET NULL,
    default_font_text INT REFERENCES fonts(id) ON DELETE SET NULL,
    contact_email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- SECTIONS (containers d'éléments)
-- ===============================
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    page_id INT NOT NULL REFERENCES page(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('hero', 'standard', 'footer')),
    position INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_page_id ON sections(page_id);
CREATE INDEX idx_sections_position ON sections(position);

-- ===============================
-- ELEMENTS (texte, media, card, gallery, youtube)
-- ===============================
CREATE TABLE elements (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'media', 'card', 'gallery', 'youtube', 'contact', 'link')),
    col_start INT NOT NULL CHECK (col_start >= 1 AND col_start <= 12),
    col_end INT NOT NULL CHECK (col_end >= 1 AND col_end <= 12),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_elements_section_id ON elements(section_id);

-- ===============================
-- LINKS (social et navigation)
-- ===============================

CREATE TABLE social_links (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL,     -- ex: "fa-brands fa-facebook"
  position INT DEFAULT 0,
  settings JSONB DEFAULT '{}'  -- couleurs, taille, hover, etc.
);

CREATE TABLE nav_links (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  position INT DEFAULT 0,
  settings JSONB DEFAULT '{}'
);

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

CREATE OR REPLACE FUNCTION update_fonts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_fonts_updated_at
BEFORE UPDATE ON fonts
FOR EACH ROW EXECUTE FUNCTION update_fonts_updated_at();