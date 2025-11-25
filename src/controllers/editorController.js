import { buildEditorData } from '../services/pageBuilder.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Affiche l'interface d'édition WYSIWYG
 */
export const showEditor = async (req, res) => {
  try {
    logger.info('🏗️ Construction des données éditeur...');

    // Construire les données complètes pour l'éditeur (toutes les sections)
    const editorData = await buildEditorData();

    // Charger les schémas des sections
    const schemasPath = join(dirname(__dirname), '..', 'config', 'schemas.json');
    const sectionSchemas = JSON.parse(readFileSync(schemasPath, 'utf8'));

    logger.info(`📊 Éditeur chargé avec ${editorData.sections.length} sections`);

    // Rendre la vue éditeur
    return res.render('pages/editor', {
      title: 'Éditeur',
      pageData: editorData,
      sectionSchemas: sectionSchemas,
      user: req.user
    });

  } catch (error) {
    logger.error('Erreur construction éditeur:', error);

    // En cas d'erreur, rendre avec des données minimales
    return res.render('pages/editor', {
      title: 'Éditeur',
      pageData: {
        page: {},
        sections: [],
        fonts: []
      },
      sectionSchemas: {},
      user: req.user
    });
  }
};;