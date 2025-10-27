-- Seed des éléments de blocs pour la démonstration
-- À exécuter après 001_schema.sql

-- Éléments pour le bloc Actualités (id=2 dans la seed de base)
INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
(2, 'card', 1, '{"title": "Concert au Port", "description": "Rejoignez-nous pour un concert exceptionnel au Vieux Port de La Rochelle le 15 juin."}', '/images/placeholder-1.jpg'),
(2, 'card', 2, '{"title": "Atelier débutants", "description": "Découvrez le batucada lors de notre atelier d''initiation gratuit chaque mercredi."}', '/images/placeholder-2.jpg'),
(2, 'card', 3, '{"title": "Festival d''été", "description": "Batala LR participera au Festival International des Rythmes du Monde cet été."}', '/images/placeholder-3.jpg');

-- Éléments pour le bloc Offres (id=3 dans la seed de base)
INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
(3, 'card', 1, '{"title": "Cours hebdomadaires", "description": "Cours de batucada tous les mercredis de 19h à 21h pour tous niveaux."}', '/images/icon-drums.svg'),
(3, 'card', 2, '{"title": "Événements privés", "description": "Animations musicales pour vos mariages, anniversaires et événements d''entreprise."}', '/images/icon-event.svg'),
(3, 'card', 3, '{"title": "Stages intensifs", "description": "Stages de perfectionnement pendant les vacances scolaires avec nos maîtres percussionnistes."}', '/images/icon-training.svg');

-- Élément pour le header (id=1) - image de fond et logo
INSERT INTO block_elements (block_id, type, position, content, media_path) VALUES
(1, 'image', 1, '{"alt": "Logo Batala LR"}', '/images/logo.png'),
(1, 'image', 2, '{"alt": "Image de fond header"}', '/images/header-bg.jpg');

-- Élément pour le footer (id=4) - contenu À propos
INSERT INTO block_elements (block_id, type, position, content) VALUES
(4, 'text', 1, '{"about_title": "À propos de Batala La Rochelle", "about_content": "Batala La Rochelle est une association de percussions brésiliennes créée en 2010. Nous pratiquons le batucada, un style de musique afro-brésilienne rythmé et festif. Notre groupe se produit régulièrement dans la région Nouvelle-Aquitaine."}'),
(4, 'contact', 2, '{"email": "contact@batala-lr.fr", "phone": "+33 6 12 34 56 78"}'),
(4, 'social', 3, '{"links": [{"network": "facebook", "url": "https://facebook.com/batalalr"}, {"network": "instagram", "url": "https://instagram.com/batalalr"}, {"network": "youtube", "url": "https://youtube.com/@batalalr"}, {"network": "tiktok", "url": "https://tiktok.com/@batalalr"}]}');
