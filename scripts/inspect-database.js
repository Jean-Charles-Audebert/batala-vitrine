/**
 * Script d'inspection complète de la base de données
 */

import { query } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

async function inspectDatabase() {
  try {
    console.log('=== INSPECTION COMPLETE DE LA BASE DE DONNEES ===\n');

    // Liste des tables à inspecter
    const tables = [
      'admins',
      'page',
      'sections',
      'elements',
      'fonts',
      'refresh_tokens'
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

        if (count > 0) {
          // Récupérer tous les enregistrements
          const { rows } = await query(`SELECT * FROM ${table} ORDER BY id`);

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
        } else {
          console.log('Aucun enregistrement trouve.\n');
        }
      } catch (error) {
        console.log(`ERREUR lors de la lecture de la table ${table}: ${error.message}\n`);
      }
    }

    console.log('=== INSPECTION TERMINEE ===');

  } catch (error) {
    console.error('ERREUR GENERALE:', error);
  }
}

// Exécuter l'inspection
inspectDatabase();