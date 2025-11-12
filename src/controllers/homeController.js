import { query } from "../config/db.js";
import { getSocialIcon } from "../utils/socialIcons.js";
import { logger } from "../utils/logger.js";

export const showHome = async (req, res, deps = {}) => {
  const { query: _query = query } = deps;
  try {
    // Debug: vérifier la base de données actuelle
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
    
    // Récupérer tous les blocs dans l'ordre de position (avec nouveaux champs de thème)
    const { rows: blocks } = await _query(
      "SELECT id, type, title, slug, position, header_logo, header_title, bg_image, is_transparent, bg_color, title_font, title_color FROM blocks ORDER BY position ASC"
    );
    
    // Pour chaque bloc, récupérer ses éléments selon le type
    for (const block of blocks) {
      if (block.type === 'footer') {
        // Footer: éléments spécifiques dans la table footer_elements
        const { rows: elements } = await _query(
          "SELECT id, type, position, content FROM footer_elements WHERE block_id=$1 ORDER BY position ASC",
          [block.id]
        );
        
        // Parser le JSON content pour chaque élément
        block.elements = elements.map(el => ({
          ...el,
          parsedContent: el.content ? JSON.parse(el.content) : null
        }));
      } else if (block.type !== 'header') {
        // Autres blocs (actus, offres, ...): charger les cartes normalisées (avec nouveaux champs de thème)
        const { rows: cards } = await _query(
          "SELECT id, position, title, description, media_path, bg_color, title_color, description_color, description_bg_color FROM cards WHERE block_id=$1 ORDER BY position ASC",
          [block.id]
        );
        block.cards = cards;
      }
      // Header: utilise désormais les champs du bloc (header_logo, header_title, bg_image)
    }
    
    res.render("pages/index", {
      title: "Accueil",
      blocks,
      pageSettings,
      user: req.user || null,
      getSocialIcon
    });
  } catch (error) {
    logger.error("Erreur récupération blocs", error);
    res.render("pages/index", {
      title: "Accueil",
      blocks: [],
      pageSettings: { theme: {} },
      user: null,
      getSocialIcon
    });
  }
};
