-- ===============================
-- Seed générique: Site Vitrine Générique
-- ===============================

-- Sections de démonstration
INSERT INTO sections (title, show_title, is_visible, position, layout, settings)
VALUES
  ('Accueil', TRUE, TRUE, 1, '{"type":"hero"}', '{"padding_top":"large","padding_bottom":"large","background_color":"#ffffff"}'),
  ('Présentation', TRUE, TRUE, 2, '{"type":"image_left"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('Services', TRUE, TRUE, 3, '{"type":"grid_3"}', '{"padding_top":"medium","padding_bottom":"medium","background_color":"#f8f9fa"}'),
  ('Équipe', TRUE, TRUE, 4, '{"type":"grid_3"}', '{"padding_top":"medium","padding_bottom":"medium"}'),
  ('Témoignages', TRUE, TRUE, 5, '{"type":"grid_2"}', '{"padding_top":"medium","padding_bottom":"medium","background_color":"#f8f9fa"}'),
  ('Contact', TRUE, TRUE, 999, '{"type":"full_width"}', '{"padding_top":"large","padding_bottom":"large","background_color":"#343a40","text_color":"#ffffff"}');

-- Section Hero - Texte principal
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'Bienvenue sur notre site', 0, '{"content":"Découvrez nos services et notre expertise","subtitle":"Votre partenaire de confiance","alignment":"center","font_size":48}'
FROM sections WHERE title='Accueil' LIMIT 1;

-- Section Présentation - Média seul
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'media', 'Image de présentation', 0, '{"url":"/assets/placeholder-hero.svg","width":600,"height":400,"alignment":"center","alt":"Image de présentation"}'
FROM sections WHERE title='Présentation' LIMIT 1;

-- Section Présentation - Texte et média
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'À propos de nous', 1, '{"content":"Nous sommes une entreprise spécialisée dans... Notre équipe d''experts vous accompagne dans tous vos projets.","alignment":"left","font_size":18}'
FROM sections WHERE title='Présentation' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'media', 'Équipe au travail', 2, '{"url":"/assets/placeholder-team.svg","width":400,"height":300,"alignment":"right","alt":"Notre équipe"}'
FROM sections WHERE title='Présentation' LIMIT 1;

-- Section Services - 3 cartes
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Conseil & Stratégie', 0, '{"description":"Accompagnement stratégique personnalisé pour atteindre vos objectifs business.","media_url":"/assets/icon-consulting.svg","link_url":"#","link_text":"En savoir plus"}'
FROM sections WHERE title='Services' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Développement Web', 1, '{"description":"Création de sites web modernes et performants adaptés à vos besoins.","media_url":"/assets/icon-web.svg","link_url":"#","link_text":"Voir nos réalisations"}'
FROM sections WHERE title='Services' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Support & Maintenance', 2, '{"description":"Service de support technique et maintenance pour assurer la continuité de vos services.","media_url":"/assets/icon-support.svg","link_url":"#","link_text":"Contactez-nous"}'
FROM sections WHERE title='Services' LIMIT 1;

-- Section Équipe - Photos avec légendes
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'photo', 'Marie Dupont', 0, '{"url":"/assets/placeholder-person1.svg","caption":"Directrice Générale - 15 ans d''expérience","width":250,"height":300}'
FROM sections WHERE title='Équipe' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'photo', 'Jean Martin', 1, '{"url":"/assets/placeholder-person2.svg","caption":"Chef de Projet - Expert technique","width":250,"height":300}'
FROM sections WHERE title='Équipe' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'photo', 'Sophie Leroy', 2, '{"url":"/assets/placeholder-person3.svg","caption":"Responsable Marketing - Stratégie digitale","width":250,"height":300}'
FROM sections WHERE title='Équipe' LIMIT 1;

-- Section Témoignages - 2 cartes avec dates
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Client Satisfait', 0, '{"description":"« Une collaboration exceptionnelle ! L''équipe a su comprendre nos besoins et livrer un projet de qualité supérieure. »","event_date":"2024-10-15"}'
FROM sections WHERE title='Témoignages' LIMIT 1;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'card', 'Partenaire Commercial', 1, '{"description":"« Professionnalisme et réactivité sont les maîtres-mots de cette entreprise. Je recommande vivement leurs services. »","event_date":"2024-09-22"}'
FROM sections WHERE title='Témoignages' LIMIT 1;

-- Section Contact - Texte et formulaire
INSERT INTO elements (section_id, type, title, position, settings)
SELECT id, 'text', 'Contactez-nous', 0, '{"content":"Prêt à commencer votre projet ? N''hésitez pas à nous contacter.","subtitle":"Nous sommes là pour vous aider","alignment":"center","font_size":24}'
FROM sections WHERE title='Contact' LIMIT 1;

-- Super-admin générique
INSERT INTO admins (email, password_hash, is_active, is_super_admin)
VALUES ('admin@site.com', '$argon2id$v=19$m=65536,t=3,p=4$5SS/7fdoqyZ2whGH971gHA$ldQvqy8Rl724zQeGyqYoVik5ws80kMbSJRaDNNMj5fY', TRUE, TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE, is_super_admin = TRUE;

-- Admin test pour E2E
INSERT INTO admins (email, password_hash, is_active)
VALUES ('admin@test.com', '$argon2id$v=19$m=65536,t=3,p=4$v8MRVaePErBGqw6Hxad0hw$M3XDrsLYmWLQIx2QuF2a+WLPCQ/PF4kR2Wm4siIrZyY', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE;

-- Fonts populaires et variées
INSERT INTO fonts (name, source, url, font_family) VALUES
('Inter', 'google', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', 'Inter'),
('Roboto', 'google', 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', 'Roboto'),
('Open Sans', 'google', 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap', 'Open Sans'),
('Lato', 'google', 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap', 'Lato'),
('Montserrat', 'google', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap', 'Montserrat'),
('Poppins', 'google', 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', 'Poppins'),
('Playfair Display', 'google', 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap', 'Playfair Display'),
('Merriweather', 'google', 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap', 'Merriweather'),
('Source Sans Pro', 'google', 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap', 'Source Sans Pro'),
('Nunito', 'google', 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap', 'Nunito');

-- Page singleton générique
INSERT INTO page (id, title, main_bg_color, main_bg_media_url, main_bg_youtube_url, main_bg_opacity, main_bg_position, title_font_id, text_font_id, contact_email)
VALUES (1, 'Mon Site Vitrine', '#ffffff', NULL, NULL, 1.0, 'center', NULL, NULL, 'contact@monsite.com')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  main_bg_color = EXCLUDED.main_bg_color,
  main_bg_media_url = EXCLUDED.main_bg_media_url,
  main_bg_youtube_url = EXCLUDED.main_bg_youtube_url,
  main_bg_opacity = EXCLUDED.main_bg_opacity,
  main_bg_position = EXCLUDED.main_bg_position,
  title_font_id = EXCLUDED.title_font_id,
  text_font_id = EXCLUDED.text_font_id,
  contact_email = EXCLUDED.contact_email;
