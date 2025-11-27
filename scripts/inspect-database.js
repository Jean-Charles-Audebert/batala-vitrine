/**
 * Script d'inspection complète de la base de données
 * Et ajout des colonnes manquantes pour le hero
 */

import { query } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

async function inspectAndMigrateDatabase() {
  try {
    console.log('=== INSPECTION ET MIGRATION DE LA BASE DE DONNEES ===\n');

    // 1. Vérifier et ajouter les colonnes manquantes à la table sections
    console.log('🔍 Vérification des colonnes de la table sections...');

    const requiredColumns = [
      'logo_url VARCHAR(1024)',
      'logo_width INTEGER DEFAULT 150',
      'logo_position_h VARCHAR(20) DEFAULT \'center\'',
      'logo_position_v VARCHAR(20) DEFAULT \'center\'',
      'show_social_links BOOLEAN DEFAULT FALSE',
      'social_position_h VARCHAR(20) DEFAULT \'right\'',
      'social_position_v VARCHAR(20) DEFAULT \'top\'',
      'social_icon_size INTEGER DEFAULT 24',
      'social_icon_color VARCHAR(20) DEFAULT \'#ffffff\'',
      'show_nav_links BOOLEAN DEFAULT FALSE',
      'nav_position_h VARCHAR(20) DEFAULT \'right\'',
      'nav_position_v VARCHAR(20) DEFAULT \'center\'',
      'nav_text_color VARCHAR(20) DEFAULT \'#ffffff\'',
      'nav_bg_color VARCHAR(100) DEFAULT \'rgba(255,255,255,0.25)\'',
      'is_sticky BOOLEAN DEFAULT FALSE'
    ];

    for (const columnDef of requiredColumns) {
      const [columnName] = columnDef.split(' ');
      try {
        // Vérifier si la colonne existe
        await query(`SELECT ${columnName} FROM sections LIMIT 1`);
        console.log(`✅ Colonne ${columnName} existe`);
      } catch (error) {
        // Ajouter la colonne si elle n'existe pas
        try {
          await query(`ALTER TABLE sections ADD COLUMN ${columnDef}`);
          console.log(`➕ Colonne ${columnName} ajoutée`);
        } catch (addError) {
          console.log(`❌ Erreur ajout colonne ${columnName}: ${addError.message}`);
        }
      }
    }

    // 2. Créer la table hero_nav_links si elle n'existe pas
    console.log('\n🔍 Vérification de la table hero_nav_links...');
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS hero_nav_links (
          id SERIAL PRIMARY KEY,
          section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
          target_section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
          label VARCHAR(255) NOT NULL,
          position INT DEFAULT 0,
          is_visible BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Table hero_nav_links créée/vérifiée');

      // Créer un index si nécessaire
      try {
        await query(`CREATE INDEX IF NOT EXISTS idx_hero_nav_links_section_id ON hero_nav_links(section_id)`);
        console.log('✅ Index hero_nav_links créé');
      } catch (indexError) {
        console.log('ℹ️ Index hero_nav_links déjà existant');
      }
    } catch (tableError) {
      console.log(`❌ Erreur création table hero_nav_links: ${tableError.message}`);
    }

    // 3. Inspection des données
    console.log('\n=== INSPECTION DES DONNEES ===\n');

    const tables = [
      'admins',
      'page',
      'sections',
      'elements',
      'fonts',
      'hero_nav_links'
    ];

    for (const table of tables) {
      console.log('==================================================');
      console.log(`TABLE: ${table.toUpperCase()}`);
      console.log('==================================================');

      try {
        // Compter les enregistrements
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`Nombre d'enregistrements: ${count}\n`);

        if (count > 0 && count <= 5) { // Limiter l'affichage pour les tables avec peu de données
          // Récupérer tous les enregistrements
          const { rows } = await query(`SELECT * FROM ${table} ORDER BY id LIMIT 5`);

          rows.forEach((row, index) => {
            console.log(`--- Enregistrement ${index + 1} ---`);
            Object.keys(row).forEach(key => {
              let value = row[key];
              // Formater les valeurs JSONB et les dates
              if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value, null, 2);
              }
              console.log(`  ${key}: ${value}`);
            });
            console.log('');
          });
        } else if (count > 5) {
          console.log(`Trop d'enregistrements (${count}), affichage limité.\n`);
        } else {
          console.log('Aucun enregistrement trouvé.\n');
        }
      } catch (error) {
        console.log(`ERREUR lors de la lecture de la table ${table}: ${error.message}\n`);
      }
    }

    console.log('=== MIGRATION TERMINEE ===');

  } catch (error) {
    console.error('ERREUR GENERALE:', error);
  }
}

// Exécuter l'inspection et migration
inspectAndMigrateDatabase();