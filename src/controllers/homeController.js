import { buildPageData, loadFonts } from '../services/pageBuilder.js';
import { logger } from '../utils/logger.js';
import { query } from '../config/db.js';
import { isVideoFilePath, extractYouTubeIdServer } from '../utils/mediaHelper.js';
import { mapSocialLinkIcons } from '../utils/socialIconDetector.js';

export const showHome = async (req, res) => {
  try {
    // Construire les données complètes de la page
    const pageData = await buildPageData();

    // Charger les polices
    const fonts = await loadFonts();

    // Charger les liens sociaux (si la table existe)
    let socialLinks = [];
    try {
      const result = await query(`
        SELECT * FROM social_links
        ORDER BY position ASC
      `);
      socialLinks = result.rows;
    } catch (socialError) {
      // La table social_links n'existe pas encore, c'est OK
    }

    // Extraire les liens de navigation depuis les sections
    const navigationLinks = pageData.sections
      .filter(section => section.type === 'link')
      .map(section => ({
        settings: {
          target_section_id: section.id,
          label: section.settings?.title || 'Section'
        }
      }));

    // Rendre la vue avec les données unifiées
    return res.render('pages/index-v2', {
      title: 'Accueil',
      ...pageData,
      fonts,
      socialLinks: mapSocialLinkIcons(socialLinks),
      // Passer les helpers EJS
      isVideoFilePath,
      extractYouTubeIdServer,
      user: req.user || null,
      navigationLinks
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
      user: req.user || null
    });
  }
};
