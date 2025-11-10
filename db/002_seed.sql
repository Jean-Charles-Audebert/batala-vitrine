-- Seed consolidé: Batala Vitrine WMS

-- Blocs de base
-- Note: is_transparent, bg_color, title_font, title_color added for theme customization
-- Footer has explicit bg_color (#424242) to never be transparent
INSERT INTO blocks (type, title, slug, position, is_active, is_locked, is_collapsible, is_transparent, bg_color, title_font, title_color)
VALUES
  ('header', 'En-tête du site', 'header', 1, TRUE, TRUE, FALSE, FALSE, NULL, NULL, NULL),
  ('events', 'Événements à venir', 'evenements', 2, TRUE, FALSE, FALSE, TRUE, NULL, NULL, NULL),
  ('offers', 'Nos offres', 'offres', 3, TRUE, FALSE, FALSE, TRUE, NULL, NULL, NULL),
  ('footer', 'Pied de page', 'footer', 999, TRUE, TRUE, FALSE, FALSE, '#424242', NULL, '#e0e0e0');

-- Header: logo, background, titre
UPDATE blocks
SET header_logo = '/assets/logo-default.svg',
    bg_image = '/assets/header-bg-default.svg',
    header_title = 'Titre de la page'
WHERE slug = 'header';

-- Cartes: Événements (avec dates)
-- Note: bg_color, title_color, description_color added for card theme customization (NULL = inherit from parent)
INSERT INTO cards (block_id, position, title, description, media_path, event_date, bg_color, title_color, description_color)
SELECT b.id, 1, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-1.svg', '2025-06-15', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'evenements';

INSERT INTO cards (block_id, position, title, description, media_path, event_date, bg_color, title_color, description_color)
SELECT b.id, 2, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-2.svg', '2025-05-20', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'evenements';

INSERT INTO cards (block_id, position, title, description, media_path, event_date, bg_color, title_color, description_color)
SELECT b.id, 3, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-3.svg', '2025-07-10', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'evenements';

-- Cartes: Offres (sans dates)
INSERT INTO cards (block_id, position, title, description, media_path, bg_color, title_color, description_color)
SELECT b.id, 1, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-drums.svg', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'offres';

INSERT INTO cards (block_id, position, title, description, media_path, bg_color, title_color, description_color)
SELECT b.id, 2, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-event.svg', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'offres';

INSERT INTO cards (block_id, position, title, description, media_path, bg_color, title_color, description_color)
SELECT b.id, 3, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-training.svg', NULL, NULL, NULL
FROM blocks b WHERE b.slug = 'offres';

-- Footer
INSERT INTO footer_elements (block_id, type, position, content) 
SELECT b.id, 'text', 1, '{"about_title": "À propos de nous", "about_content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante."}'
FROM blocks b WHERE b.slug = 'footer';

INSERT INTO footer_elements (block_id, type, position, content)
SELECT b.id, 'contact', 2, '{"email": "contact@email.fr", "phone": "+33 6 12 34 56 78"}'
FROM blocks b WHERE b.slug = 'footer';

INSERT INTO footer_elements (block_id, type, position, content)
SELECT b.id, 'social', 3, '{"links": [{"network": "facebook", "url": "https://facebook.com/lien"}, {"network": "instagram", "url": "https://instagram.com/lien"}, {"network": "youtube", "url": "https://youtube.com/lien"}, {"network": "tiktok", "url": "https://tiktok.com/lien"}]}'
FROM blocks b WHERE b.slug = 'footer';

-- Admin de test pour E2E (password: SecureP@ss123)
INSERT INTO admins (email, password_hash, is_active)
VALUES ('admin@batala.fr', '$argon2id$v=19$m=65536,t=3,p=4$T+ptavBGgyk2ox+u+ZF46g$u9zuOPKAXB2uRRu3pM30Vk/2KpAcQx+4cQiVbOI0mCU', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
