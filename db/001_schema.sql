-- ======================================
--  Schema: Batala Vitrine WMS (consolidé)
-- ======================================

-- Drops (facultatifs en dev)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS footer_elements CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
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
--  PAGE (singleton pour thème global)
-- ===============================
CREATE TABLE page (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Mon Site',
    theme JSONB DEFAULT '{"bg_color":"#ffffff","text_color":"#333333","primary_color":"#2196F3","secondary_color":"#FFC107","font_family":"Arial, sans-serif"}',
    bg_image VARCHAR(512),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer la ligne unique par défaut
INSERT INTO page (id, title) VALUES (1, 'Batala La Rochelle');

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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_path VARCHAR(512),
    style JSONB DEFAULT '{}',
    event_date DATE,
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
