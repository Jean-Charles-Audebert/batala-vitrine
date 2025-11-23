-- Migration: Ajout de la table elements pour la nouvelle structure modulaire
-- Cette migration ajoute la table elements et migre les données existantes

-- Créer la table elements
CREATE TABLE IF NOT EXISTS elements (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'media', 'card', 'photo', 'video')),
  title VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_elements_section_id ON elements(section_id);
CREATE INDEX IF NOT EXISTS idx_elements_position ON elements(position);
CREATE INDEX IF NOT EXISTS idx_elements_type ON elements(type);

-- Migration des données existantes depuis section_content vers elements
-- Pour la section "Bienvenue" (hero)
INSERT INTO elements (section_id, type, title, position, settings)
SELECT
  s.id,
  'text',
  COALESCE(sc.title, 'Titre de la page'),
  COALESCE(sc.position, 0),
  jsonb_build_object(
    'font_size', 48,
    'alignment', 'center',
    'content', COALESCE(sc.description, 'Bienvenue sur notre site')
  )
FROM sections s
LEFT JOIN section_content sc ON sc.section_id = s.id
WHERE s.title = 'Bienvenue' AND sc.title IS NOT NULL;

-- Pour la section "À propos"
INSERT INTO elements (section_id, type, title, position, settings)
SELECT
  s.id,
  'text',
  COALESCE(sc.title, 'À propos de nous'),
  COALESCE(sc.position, 0),
  jsonb_build_object(
    'font_size', 24,
    'alignment', 'left',
    'content', COALESCE(sc.description, 'Description de l''entreprise')
  )
FROM sections s
LEFT JOIN section_content sc ON sc.section_id = s.id
WHERE s.title = 'À propos' AND sc.title IS NOT NULL;

INSERT INTO elements (section_id, type, title, position, settings)
SELECT
  s.id,
  'media',
  'Image À propos',
  1,
  jsonb_build_object(
    'url', COALESCE(sc.media_url, '/assets/placeholder-1.svg'),
    'width', 400,
    'height', 300,
    'alignment', 'left'
  )
FROM sections s
LEFT JOIN section_content sc ON sc.section_id = s.id
WHERE s.title = 'À propos' AND sc.media_url IS NOT NULL;

-- Migration des cartes depuis cards_v2
INSERT INTO elements (section_id, type, title, position, settings)
SELECT
  section_id,
  'card',
  title,
  position,
  jsonb_build_object(
    'description', COALESCE(description, ''),
    'media_url', media_url,
    'event_date', event_date,
    'link_url', link_url
  )
FROM cards_v2;

-- Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_elements_updated_at
    BEFORE UPDATE ON elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();