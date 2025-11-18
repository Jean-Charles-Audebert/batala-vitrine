-- Migration: Ajout table social_links (réutilisable header/footer)
-- Date: 2025-11-18

CREATE TABLE IF NOT EXISTS social_links (
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

-- Données de démonstration
INSERT INTO social_links (platform, url, label, location, position) VALUES
('facebook', 'https://facebook.com/example', 'Facebook', 'footer', 1),
('instagram', 'https://instagram.com/example', 'Instagram', 'footer', 2),
('youtube', 'https://youtube.com/example', 'YouTube', 'footer', 3),
('tiktok', 'https://tiktok.com/@example', 'TikTok', 'footer', 4);
