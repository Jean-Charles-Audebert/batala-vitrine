-- Seed consolidé: Batala Vitrine WMS

-- Blocs de base
INSERT INTO blocks (type, title, slug, position, is_active, is_locked, is_collapsible)
VALUES
  ('header', 'En-tête du site', 'header', 1, TRUE, TRUE, FALSE),
  ('events', 'Événements à venir', 'evenements', 2, TRUE, FALSE, FALSE),
  ('offers', 'Nos offres', 'offres', 3, TRUE, FALSE, FALSE),
  ('footer', 'Pied de page', 'footer', 4, TRUE, TRUE, FALSE);

-- Header: logo, background, titre
UPDATE blocks
SET header_logo = '/assets/logo-default.svg',
    bg_image = '/assets/header-bg-default.svg',
    header_title = 'Titre de la page'
WHERE slug = 'header';

-- Cartes: Événements (avec dates)
INSERT INTO cards (block_id, position, title, description, media_path, event_date)
SELECT b.id, 1, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-1.svg', '2025-06-15'
FROM blocks b WHERE b.slug = 'evenements';

INSERT INTO cards (block_id, position, title, description, media_path, event_date)
SELECT b.id, 2, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-2.svg', '2025-05-20'
FROM blocks b WHERE b.slug = 'evenements';

INSERT INTO cards (block_id, position, title, description, media_path, event_date)
SELECT b.id, 3, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-3.svg', '2025-07-10'
FROM blocks b WHERE b.slug = 'evenements';

-- Cartes: Offres (sans dates)
INSERT INTO cards (block_id, position, title, description, media_path)
SELECT b.id, 1, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-drums.svg'
FROM blocks b WHERE b.slug = 'offres';

INSERT INTO cards (block_id, position, title, description, media_path)
SELECT b.id, 2, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-event.svg'
FROM blocks b WHERE b.slug = 'offres';

INSERT INTO cards (block_id, position, title, description, media_path)
SELECT b.id, 3, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-training.svg'
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
VALUES ('admin@batala.fr', '$argon2id$v=19$m=65536,t=3,p=4$pz+JftZLX2IfbH4g3Wvjaw$hW2b2kV8VqZv3J0S5B7dQcEqZ+FnW7Z4TgW3zJ5M8nQ', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;
