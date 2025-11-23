-- ===============================
-- Seed minimal: Site Vitrine WMS (nouvelle structure)
-- ===============================

-- Sections de base
INSERT INTO sections (title, show_title, is_visible, position, layout, settings)
VALUES
  ('Bienvenue', TRUE, TRUE, 1, '{"type":"grid_3x3"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('À propos', TRUE, TRUE, 2, '{"type":"image_left"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('Événements à venir', TRUE, TRUE, 3, '{"type":"grid_3"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('Nos prestations', TRUE, TRUE, 4, '{"type":"grid_3"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('Contact', TRUE, TRUE, 999, NULL, '{"padding_top":"medium","padding_bottom":"medium"}');

-- Elements pour la section Hero
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'Titre de la page', 0, '{"font_size":48,"alignment":"center"}'
FROM sections WHERE title='Bienvenue' LIMIT 1;

-- Elements pour la section "À propos"
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'À propos de nous', 0, '{"font_size":24,"alignment":"left"}'
FROM sections WHERE title='À propos' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'media', 'Image À propos', 1, '{"url":"/assets/placeholder-1.svg","width":400,"height":300,"alignment":"left"}'
FROM sections WHERE title='À propos' LIMIT 1;

-- Cards pour la section "Événements à venir"
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre actu', 0, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/placeholder-1.svg","event_date":"2025-06-15"}'
FROM sections WHERE title='Événements à venir' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre actu', 1, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/placeholder-2.svg","event_date":"2025-05-20"}'
FROM sections WHERE title='Événements à venir' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre actu', 2, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/placeholder-3.svg","event_date":"2025-07-10"}'
FROM sections WHERE title='Événements à venir' LIMIT 1;

-- Cards pour la section "Nos prestations"
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre offre', 0, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/icon-drums.svg"}'
FROM sections WHERE title='Nos prestations' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre offre', 1, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/icon-event.svg"}'
FROM sections WHERE title='Nos prestations' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Titre offre', 2, '{"description":"Lorem ipsum dolor sit amet...","media_url":"/assets/icon-training.svg"}'
FROM sections WHERE title='Nos prestations' LIMIT 1;

-- Elements pour le footer
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'À propos de nous', 0, '{"font_size":14,"alignment":"center"}'
FROM sections WHERE title='Contact' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'Contactez-nous', 1, '{"subtitle":"Informations de contact","content":"Email: contact@email.fr\\nTéléphone: +33 6 12 34 56 78"}'
FROM sections WHERE title='Contact' LIMIT 1;

-- Super-admin
INSERT INTO admins (email, password_hash, is_active, is_super_admin)
VALUES ('jc1932@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$efoy+RWRgHbSvICiimBkPg$T0uTT9oGJLClU2hkoAqoI/jD/tZnEjLgWSjxdwup0kU', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE, is_super_admin = TRUE;

-- Admin test pour E2E
INSERT INTO admins (email, password_hash, is_active)
VALUES ('admin@test.com', '$argon2id$v=19$m=65536,t=3,p=4$T+ptavBGgyk2ox+u+ZF46g$u9zuOPKAXB2uRRu3pM30Vk/2KpAcQx+4cQiVbOI0mCU', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;

-- Fonts de base
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

-- Page singleton
INSERT INTO page (id, title, title_font_id, text_font_id, contact_email)
VALUES (1, 'Site Vitrine', 3, 1, 'contact@email.fr')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, title_font_id = EXCLUDED.title_font_id, text_font_id = EXCLUDED.text_font_id, contact_email = EXCLUDED.contact_email;