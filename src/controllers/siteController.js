import { buildPageData, buildEditorData } from '../services/pageBuilder.js';
import { logger } from '../utils/logger.js';

/**
 * GET /
 * Page publique - affiche uniquement les sections visibles
 */
export const showPublicPage = async (req, res) => {
  try {
    logger.info('🏠 Chargement page publique...');

    // Récupérer les données depuis la BDD uniquement
    const pageData = await buildPageData();

    logger.info(`📄 Page publique avec ${pageData.sections.length} sections visibles`);

    // Rendre la vue publique
    return res.render('pages/public', {
      title: pageData.page.title || 'Mon Site',
      pageData,
      user: req.user || null
    });

  } catch (error) {
    logger.error('Erreur chargement page publique:', error);
    return res.status(500).render('error', {
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * GET /editor
 * Page d'édition - affiche toutes les sections (y compris invisibles)
 */
export const showEditorPage = async (req, res) => {
  try {
    logger.info('✏️ Chargement éditeur...');

    // Vérifier l'authentification
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    // Récupérer les données depuis la BDD uniquement
    const pageData = await buildEditorData();

    logger.info(`📝 Éditeur avec ${pageData.sections.length} sections totales`);

    // Rendre la vue d'édition
    return res.render('pages/editor', {
      title: 'Éditeur - ' + (pageData.page.title || 'Mon Site'),
      pageData,
      user: req.user
    });

  } catch (error) {
    logger.error('Erreur chargement éditeur:', error);
    return res.status(500).render('error', {
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};