import { buildPageData, buildEditorData } from '../services/pageBuilder.js';
import { logger } from '../utils/logger.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    // Charger les schémas des sections et éléments
    const schemasPath = join(dirname(__dirname), '..', 'config', 'schemas.json');
    const schemas = JSON.parse(readFileSync(schemasPath, 'utf8'));
    
    // Séparer schémas sections et éléments
    const sectionSchemas = {};
    const elementSchemas = {};
    
    Object.keys(schemas).forEach(key => {
      if (key.startsWith('element_')) {
        elementSchemas[key] = schemas[key];
      } else {
        sectionSchemas[key] = schemas[key];
      }
    });

    logger.info(`📝 Éditeur avec ${pageData.sections.length} sections totales`);

    // Rendre la vue d'édition
    return res.render('pages/editor', {
      title: 'Éditeur - ' + (pageData.page.title || 'Mon Site'),
      pageData,
      sectionSchemas,
      elementSchemas,
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