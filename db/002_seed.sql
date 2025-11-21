-- Seed consolidé: Batala Vitrine WMS (sections v2)

-- Sections de base (remplacement du système blocks legacy)
INSERT INTO sections (type, title, position, is_visible, layout, padding_top, padding_bottom)
VALUES
  ('hero', 'Bienvenue', 1, TRUE, NULL, 'medium', 'medium'),
  ('content', 'À propos', 2, TRUE, 'image_left', 'medium', 'medium'),
  ('card_grid', 'Événements à venir', 3, TRUE, 'grid_3', 'medium', 'medium'),
  ('card_grid', 'Nos prestations', 4, TRUE, 'grid_3', 'medium', 'medium'),
  ('footer', 'Contact', 999, TRUE, NULL, 'medium', 'medium');

-- Contenu pour la section hero
INSERT INTO section_content (section_id, title, subtitle, description, cta_label, cta_url, position)
SELECT id, 'Titre de la page', NULL, NULL, NULL, NULL, 0
FROM sections WHERE type = 'hero' LIMIT 1;

-- Contenu pour la section "À propos"
INSERT INTO section_content (section_id, title, description, position)
SELECT id, 'À propos de nous', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', 0
FROM sections WHERE type = 'content' AND title = 'À propos' LIMIT 1;

-- Cartes pour la section "Événements à venir"
INSERT INTO cards_v2 (section_id, title, description, media_url, event_date, position)
SELECT s.id, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-1.svg', '2025-06-15', 0
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Événements à venir' LIMIT 1;

INSERT INTO cards_v2 (section_id, title, description, media_url, event_date, position)
SELECT s.id, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-2.svg', '2025-05-20', 1
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Événements à venir' LIMIT 1;

INSERT INTO cards_v2 (section_id, title, description, media_url, event_date, position)
SELECT s.id, 'Titre actu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante. Ut quis dignissim metus. Phasellus velit elit, tempor eget augue varius, sagittis placerat sem.', '/assets/placeholder-3.svg', '2025-07-10', 2
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Événements à venir' LIMIT 1;

-- Cartes pour la section "Nos prestations"
INSERT INTO cards_v2 (section_id, title, description, media_url, position)
SELECT s.id, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-drums.svg', 0
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Nos prestations' LIMIT 1;

INSERT INTO cards_v2 (section_id, title, description, media_url, position)
SELECT s.id, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-event.svg', 1
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Nos prestations' LIMIT 1;

INSERT INTO cards_v2 (section_id, title, description, media_url, position)
SELECT s.id, 'Titre offre', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', '/assets/icon-training.svg', 2
FROM sections s WHERE s.type = 'card_grid' AND s.title = 'Nos prestations' LIMIT 1;

-- Contenu pour la section footer
INSERT INTO section_content (section_id, title, description, position)
SELECT id, 'À propos de nous', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras luctus nunc nec erat placerat ornare. Mauris nibh nunc, tempus ut quam at, varius rutrum ante.', 0
FROM sections WHERE type = 'footer' LIMIT 1;

INSERT INTO section_content (section_id, title, subtitle, description, position)
SELECT id, 'Contactez-nous', 'Informations de contact', 'Email: contact@email.fr\nTéléphone: +33 6 12 34 56 78', 1
FROM sections WHERE type = 'footer' LIMIT 1;

-- Super-admin (non listé dans l'interface admin)
INSERT INTO admins (email, password_hash, is_active, is_super_admin)
VALUES ('jc1932@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$efoy+RWRgHbSvICiimBkPg$T0uTT9oGJLClU2hkoAqoI/jD/tZnEjLgWSjxdwup0kU', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE, is_super_admin = TRUE;

-- Admin de test pour E2E (password: SecureP@ss123)
INSERT INTO admins (email, password_hash, is_active)
VALUES ('admin@batala.fr', '$argon2id$v=19$m=65536,t=3,p=4$T+ptavBGgyk2ox+u+ZF46g$u9zuOPKAXB2uRRu3pM30Vk/2KpAcQx+4cQiVbOI0mCU', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;

-- ===============================  
--  FONTS (bibliothèque de polices)
-- ===============================
INSERT INTO fonts (name, source, url, font_family) VALUES
('roboto', 'google', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', 'Roboto'),
('opensans', 'google', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap', 'Open Sans'),
('lato', 'google', 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap', 'Lato'),
('montserrat', 'google', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap', 'Montserrat'),
('raleway', 'google', 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap', 'Raleway'),
('playfair', 'google', 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap', 'Playfair Display'),
('merriweather', 'google', 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap', 'Merriweather'),
('nunito', 'google', 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap', 'Nunito'),
('poppins', 'google', 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', 'Poppins'),
('sourcesans', 'google', 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap', 'Source Sans Pro');

-- ===============================  
--  PAGE SETTINGS (singleton)
-- ===============================
INSERT INTO page (id, title, main_bg_color, main_title_color, footer_bg_color, footer_text_color, title_font_id)
VALUES (1, 'Batala Vitrine', '#f5f5f5', '#333333', '#2c3e50', '#ecf0f1', 4) -- Montserrat par défaut
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  main_bg_color = EXCLUDED.main_bg_color,
  main_title_color = EXCLUDED.main_title_color,
  footer_bg_color = EXCLUDED.footer_bg_color,
  footer_text_color = EXCLUDED.footer_text_color,
  title_font_id = EXCLUDED.title_font_id;

-- ===============================
--  DÉCORATIONS (v2 sections)
-- ===============================
INSERT INTO decorations (name, display_name, type, description, svg_code, default_color, default_opacity, default_scale, supported_positions) VALUES
('photo_corners', 'Coins photo', 'corner', 'Triangles style fixations d''album photo', '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 40 0 L 0 40 Z" fill="currentColor"/></svg>', '#e74c3c', 0.8, 1.0, '["top-left","top-right","bottom-left","bottom-right"]'),
('watercolor_splash', 'Éclaboussure aquarelle', 'overlay', 'Effet peinture derrière le contenu', '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.3"/><circle cx="80" cy="90" r="60" fill="currentColor" opacity="0.2"/><circle cx="120" cy="110" r="50" fill="currentColor" opacity="0.25"/></svg>', '#3498db', 0.3, 1.5, '["center","top","bottom","left","right"]'),
('waves_pattern', 'Vagues stylisées', 'pattern', 'Motif vagues en fond de section', '<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,40 Q150,60 300,40 T600,40 T900,40 T1200,40 L1200,120 L0,120 Z" fill="currentColor"/></svg>', '#1abc9c', 0.2, 1.0, '["top","bottom"]'),
('geometric_frame', 'Cadre géométrique', 'frame', 'Bordure avec motifs triangulaires', '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3"><rect x="10" y="10" width="380" height="380"/><path d="M 10 10 L 30 30 M 390 10 L 370 30 M 10 390 L 30 370 M 390 390 L 370 370"/></svg>', '#2c3e50', 0.6, 1.0, '["full"]'),
('sparkles', 'Étoiles scintillantes', 'overlay', 'Petites étoiles décoratives', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 50 10 L 52 25 L 67 20 L 55 30 L 65 42 L 50 35 L 35 42 L 45 30 L 33 20 L 48 25 Z" fill="currentColor"/><circle cx="20" cy="20" r="3" fill="currentColor"/><circle cx="80" cy="25" r="2" fill="currentColor"/><circle cx="70" cy="70" r="2.5" fill="currentColor"/><circle cx="25" cy="75" r="2" fill="currentColor"/></svg>', '#f39c12', 0.5, 0.8, '["top-left","top-right","bottom-left","bottom-right","center"]'),
('diagonal_stripes', 'Rayures diagonales', 'pattern', 'Motif rayé en arrière-plan', '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 0 0 L 20 20 M -5 15 L 5 25 M 15 -5 L 25 5" stroke="currentColor" stroke-width="2"/></pattern></defs><rect width="100" height="100" fill="url(#stripes)"/></svg>', '#95a5a6', 0.15, 1.0, '["full","left","right"]'),
('confetti', 'Confettis', 'overlay', 'Confettis festifs (événements)', '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="8" height="12" fill="currentColor" transform="rotate(20 24 36)"/><circle cx="60" cy="50" r="5" fill="currentColor" opacity="0.8"/><rect x="100" y="40" width="10" height="6" fill="currentColor" transform="rotate(-15 105 43)"/><circle cx="140" cy="70" r="6" fill="currentColor" opacity="0.7"/><rect x="30" y="120" width="7" height="10" fill="currentColor" transform="rotate(35 34 125)"/><circle cx="80" cy="140" r="4" fill="currentColor"/><rect x="130" y="130" width="9" height="8" fill="currentColor" transform="rotate(-25 135 134)"/><circle cx="170" cy="160" r="5" fill="currentColor" opacity="0.9"/></svg>', '#e91e63', 0.6, 1.2, '["top","center","full"]'),
('leaves', 'Feuilles naturelles', 'corner', 'Ornements végétaux dans les coins', '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M 10 70 Q 15 50 25 45 Q 35 40 40 30 Q 35 40 30 45 Q 20 50 10 70 Z" fill="currentColor" opacity="0.7"/><path d="M 20 65 Q 30 55 40 52 Q 50 49 60 45 Q 50 50 42 54 Q 32 58 20 65 Z" fill="currentColor" opacity="0.5"/></svg>', '#27ae60', 0.4, 1.0, '["top-left","top-right","bottom-left","bottom-right"]');
