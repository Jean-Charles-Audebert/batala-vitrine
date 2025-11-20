/**
 * Migration Phase 2: Personnalisation avancée des sections
 * Ajout des champs pour polices, couleurs avancées, et effets visuels
 */

import { query } from '../src/config/db.js';

async function runMigration() {
  try {
    console.log('🚀 Démarrage migration Phase 2...');

    // Ajouter les nouveaux champs à sections
    console.log('📝 Ajout des champs à la table sections...');
    await query(`
      ALTER TABLE sections
      ADD COLUMN IF NOT EXISTS title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS subtitle_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS text_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS title_color VARCHAR(7) DEFAULT '#333333',
      ADD COLUMN IF NOT EXISTS subtitle_color VARCHAR(7) DEFAULT '#666666',
      ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#333333',
      ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#007bff',
      ADD COLUMN IF NOT EXISTS border_radius VARCHAR(20) DEFAULT 'none' CHECK (border_radius IN ('none', 'small', 'medium', 'large', 'round')),
      ADD COLUMN IF NOT EXISTS shadow VARCHAR(20) DEFAULT 'none' CHECK (shadow IN ('none', 'small', 'medium', 'large'))
    `);

    console.log('✅ Champs ajoutés à sections');

    // Ajouter les nouveaux champs à section_content
    console.log('📝 Ajout des champs à la table section_content...');
    await query(`
      ALTER TABLE section_content
      ADD COLUMN IF NOT EXISTS subtitle_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS text_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS subtitle_color VARCHAR(7) DEFAULT '#666666',
      ADD COLUMN IF NOT EXISTS bg_opacity DECIMAL(3,2) DEFAULT 1.0 CHECK (bg_opacity >= 0 AND bg_opacity <= 1),
      ADD COLUMN IF NOT EXISTS border_color VARCHAR(7),
      ADD COLUMN IF NOT EXISTS border_width INT DEFAULT 0 CHECK (border_width >= 0 AND border_width <= 10)
    `);

    console.log('✅ Champs ajoutés à section_content');

    // Ajouter les nouveaux champs à cards_v2
    console.log('📝 Ajout des champs à la table cards_v2...');
    await query(`
      ALTER TABLE cards_v2
      ADD COLUMN IF NOT EXISTS title_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS description_font_id INT REFERENCES fonts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS title_color VARCHAR(7) DEFAULT '#333333',
      ADD COLUMN IF NOT EXISTS description_color VARCHAR(7) DEFAULT '#666666',
      ADD COLUMN IF NOT EXISTS border_color VARCHAR(7),
      ADD COLUMN IF NOT EXISTS border_width INT DEFAULT 0 CHECK (border_width >= 0 AND border_width <= 5),
      ADD COLUMN IF NOT EXISTS border_radius VARCHAR(20) DEFAULT 'small' CHECK (border_radius IN ('none', 'small', 'medium', 'large', 'round'))
    `);

    console.log('✅ Champs ajoutés à cards_v2');

    console.log('🎉 Migration Phase 2 terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

runMigration();