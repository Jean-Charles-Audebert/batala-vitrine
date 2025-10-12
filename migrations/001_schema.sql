-- ======================================
--  Initial database setup : Batala Vitrine
-- ======================================

-- Clean existing tables if re-running the migration
DROP TABLE IF EXISTS carousel_images CASCADE;
DROP TABLE IF EXISTS carousels CASCADE;
DROP TABLE IF EXISTS block_elements CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
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
--  BLOCKS
-- ===============================
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    position INT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blocks_position ON blocks(position);

-- ===============================
--  BLOCK ELEMENTS
-- ===============================
CREATE TABLE block_elements (
    id SERIAL PRIMARY KEY,
    block_id INT NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    position INT NOT NULL,
    content TEXT,
    media_path VARCHAR(512),
    alignment VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_block_elements_block_id ON block_elements(block_id);
CREATE INDEX idx_block_elements_position ON block_elements(position);

-- ===============================
--  CAROUSELS
-- ===============================
CREATE TABLE carousels (
    id SERIAL PRIMARY KEY,
    block_element_id INT NOT NULL REFERENCES block_elements(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    directory_path VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carousels_block_element_id ON carousels(block_element_id);

-- ===============================
--  CAROUSEL IMAGES
-- ===============================
CREATE TABLE carousel_images (
    id SERIAL PRIMARY KEY,
    carousel_id INT NOT NULL REFERENCES carousels(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carousel_images_carousel_id ON carousel_images(carousel_id);

-- ===============================
--  INITIAL DATA
-- ===============================

-- Insert default blocks (header, actus, offres, footer)
INSERT INTO blocks (type, title, slug, position, is_locked)
VALUES
    ('header', 'En-tête du site', 'header', 1, TRUE),
    ('actus', 'Actualités', 'actualites', 2, FALSE),
    ('offres', 'Offres de services', 'offres-de-services', 3, FALSE),
    ('footer', 'Pied de page', 'footer', 4, TRUE);

-- Insert base admin (no password yet)
INSERT INTO admins (email, password_hash, is_active)
VALUES ('jc1932@gmail.com', NULL, TRUE);
