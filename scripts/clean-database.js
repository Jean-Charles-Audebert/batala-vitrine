/**
 * Script de nettoyage de la base de données
 */

import { query } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

async function cleanDatabase() {
  try {
    logger.info('🧹 Nettoyage de la base de données...');

    // Garder seulement la page la plus récente (ID le plus élevé)
    const { rows: pages } = await query('SELECT id FROM page ORDER BY id DESC');
    if (pages.length > 1) {
      const keepId = pages[0].id;
      await query('DELETE FROM page WHERE id != $1', [keepId]);
      logger.info(`📄 Pages nettoyées, conservé ID: ${keepId}`);
    }

    // Supprimer les sections orphelines
    await query('DELETE FROM sections WHERE page_id NOT IN (SELECT id FROM page)');
    logger.info('📄 Sections orphelines supprimées');

    // Supprimer les éléments orphelins
    await query('DELETE FROM elements WHERE section_id NOT IN (SELECT id FROM sections)');
    logger.info('🎯 Éléments orphelins supprimés');

    logger.info('✅ Base de données nettoyée');

  } catch (error) {
    logger.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Exécuter le nettoyage
cleanDatabase().catch(console.error);