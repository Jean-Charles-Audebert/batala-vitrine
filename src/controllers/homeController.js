import { query } from "../config/db.js";
import { getSocialIcon } from "../utils/socialIcons.js";
import { logger } from "../utils/logger.js";
import { getAllSections } from "./sectionController.js";

export const showHome = async (req, res, deps = {}) => {
  const { query: _query = query } = deps;
  try {
    // Debug: vérifier la base de données actuelle
    logger.info(`ENV check: DB_NAME=${process.env.DB_NAME}, DB_HOST=${process.env.DB_HOST}`);
    const dbCheck = await _query("SELECT current_database()");
    logger.info(`Base de données connectée: ${dbCheck.rows[0].current_database}`);
    
    // Récupérer les paramètres de la page (thème global) avec la police
    const { rows: pageRows } = await _query(`
      SELECT p.*, f.name AS font_name, f.font_family, f.url AS font_url, f.file_path AS font_file
      FROM page p
      LEFT JOIN fonts f ON p.title_font_id = f.id
      WHERE p.id=1
    `);
    const pageSettings = pageRows[0] || { theme: {} };
    
    // FEATURE FLAG: Utiliser sections v2 ou blocks legacy
    const useSectionsV2 = process.env.USE_SECTIONS_V2 === 'true';
    
    if (useSectionsV2) {
      logger.info('📦 Utilisation du système sections v2');
      console.log('🔍 Récupération des sections...');
      const sections = await getAllSections();
      console.log('✅ Sections récupérées:', sections.length);
      logger.info(`📊 ${sections.length} sections récupérées`);
      
      // Charger les réseaux sociaux
      const { getAllSocialLinks } = await import('./socialLinksController.js');
      const socialLinks = await getAllSocialLinks();
      
      // Charger les polices disponibles
      const { rows: fonts } = await _query('SELECT id, name, font_family, url, file_path FROM fonts ORDER BY name');
      
      logger.info('🎨 Rendu de la vue index-v2...');
      return res.render("pages/index-v2", {
        title: "Accueil",
        sections,
        socialLinks,
        pageSettings,
        fonts,
        user: req.user || null,
        getSocialIcon
      });
    }
  } catch (error) {
    logger.error("Erreur récupération sections", error);
    // Charger les réseaux sociaux même en cas d'erreur
    let socialLinks = [];
    let fonts = [];
    try {
      const { getAllSocialLinks } = await import('./socialLinksController.js');
      socialLinks = await getAllSocialLinks();
      const fontsResult = await _query('SELECT id, name, font_family, url, file_path FROM fonts ORDER BY name');
      fonts = fontsResult.rows;
    } catch (socialError) {
      logger.error("Erreur chargement social/fonts", socialError);
    }
    
    return res.render("pages/index-v2", {
      title: "Accueil",
      sections: [],
      socialLinks,
      pageSettings: { theme: {} },
      fonts,
      user: req.user || null,
      getSocialIcon
    });
  }
};
