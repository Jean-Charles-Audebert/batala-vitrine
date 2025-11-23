import { buildEditorData } from '../services/pageBuilder.js';
import { logger } from '../utils/logger.js';

/**
 * Affiche l'interface d'édition WYSIWYG
 */
export const showEditor = async (req, res) => {
  try {
    logger.info('🏗️ Construction des données éditeur...');

    // Construire les données complètes pour l'éditeur (toutes les sections)
    const editorData = await buildEditorData();

    logger.info(`📊 Éditeur chargé avec ${editorData.sections.length} sections`);

    // Rendre la vue éditeur
    return res.render('pages/editor', {
      title: 'Éditeur',
      pageData: editorData,
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
      user: req.user
    });
  }
};