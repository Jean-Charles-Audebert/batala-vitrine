import { buildPageData } from '../services/pageBuilder.js';
import { getSocialIcon } from '../utils/socialIcons.js';
import { logger } from '../utils/logger.js';
import { query } from '../config/db.js';

export const showHome = async (req, res) => {
  try {
    logger.info('🏗️ Construction des données de page...');

    // Construire les données complètes de la page
    const pageData = await buildPageData();

    // Charger les liens sociaux (si la table existe)
    let socialLinks = [];
    try {
      const result = await query(`
        SELECT * FROM social_links
        WHERE is_visible = true
        ORDER BY position ASC
      `);
      socialLinks = result.rows;
    } catch (socialError) {
      // La table social_links n'existe pas encore, c'est OK
      logger.info('ℹ️ Table social_links non trouvée, utilisation d\'une liste vide');
    }

    logger.info(`📊 Page construite avec ${pageData.sections.length} sections`);

    // Rendre la vue avec les données unifiées
    return res.render('pages/index-v2', {
      title: 'Accueil',
      ...pageData,
      socialLinks,
      user: req.user || null,
      getSocialIcon
    });

  } catch (error) {
    logger.error('Erreur construction page:', error);

    // En cas d'erreur, rendre avec des données minimales
    return res.render('pages/index-v2', {
      title: 'Accueil',
      page: {},
      sections: [],
      fonts: [],
      socialLinks: [],
      user: req.user || null,
      getSocialIcon
    });
  }
};
