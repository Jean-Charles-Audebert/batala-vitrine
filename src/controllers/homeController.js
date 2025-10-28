import { query } from "../config/db.js";
import { getSocialIcon } from "../utils/socialIcons.js";
import { logger } from "../utils/logger.js";

export const showHome = async (req, res, deps = {}) => {
  const { query: _query = query } = deps;
  try {
    // Récupérer tous les blocs dans l'ordre de position
    const { rows: blocks } = await _query(
      "SELECT id, type, title, slug, position FROM blocks ORDER BY position ASC"
    );
    
    // Pour chaque bloc, récupérer ses éléments
    for (const block of blocks) {
      const { rows: elements } = await _query(
        "SELECT id, type, position, content, media_path, alignment FROM block_elements WHERE block_id=$1 ORDER BY position ASC",
        [block.id]
      );
      block.elements = elements;
    }
    
    res.render("index", { 
      title: "Batala La Rochelle", 
      blocks,
      user: req.user || null, // Pour afficher les boutons d'édition si connecté
      getSocialIcon // Passer la fonction helper à la vue
    });
  } catch (error) {
    logger.error("Erreur récupération blocs", error);
    res.render("index", { 
      title: "Batala La Rochelle", 
      blocks: [],
      user: null,
      getSocialIcon
    });
  }
};
