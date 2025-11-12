import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { crudActionWrapper } from "../utils/controllerHelpers.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants.js";
import { calculateBlockPosition, canDeleteBlock } from "../services/blockService.js";

export const listBlocks = async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC"
    );
    res.render("pages/blocks", { 
      title: "Gestion des blocs", 
      blocks: rows,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    logger.error("Erreur récupération blocs", error);
    res.status(500).send("Erreur lors de la récupération des blocs");
  }
};

export const showNewBlockForm = (req, res) => {
  res.render("pages/block-form", { 
    title: "Créer un nouveau bloc", 
    formAction: "/blocks/new",
    block: null 
  });
};

export const createBlock = crudActionWrapper(
  async (req, res) => {
    const { type, title, slug, position } = req.body;
    
    if (!type || !title || !slug) {
      return res.render("pages/block-form", { 
        title: "Créer un nouveau bloc", 
        formAction: "/blocks/new",
        block: null,
        error: "Type, titre et slug requis." 
      });
    }
    
    // Calculer la position (délégué au service)
    const newPosition = await calculateBlockPosition(position || null);
    
    await query(
      "INSERT INTO blocks (type, title, slug, position, is_locked) VALUES ($1, $2, $3, $4, FALSE)",
      [type, title, slug, newPosition]
    );
  },
  {
    successMessage: SUCCESS_MESSAGES.BLOCK_CREATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "createBlock",
    redirectOnSuccess: "/",
    redirectOnError: "/blocks/new"
  }
);

export const showEditBlockForm = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, type, title, slug, position, is_locked, bg_image, header_logo, header_title, is_transparent, bg_color, title_font, title_color FROM blocks WHERE id=$1", 
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    const block = rows[0];
    
    // Récupérer les paramètres de la page si c'est le header
    let pageSettings = null;
    let fonts = [];
    let allBlocks = [];
    if (block.type === 'header') {
      const { rows: pageRows } = await query("SELECT * FROM page WHERE id=1");
      pageSettings = pageRows[0] || null;
      // Charger toutes les polices disponibles
      const { rows: fontRows } = await query("SELECT * FROM fonts ORDER BY source, name");
      fonts = fontRows;
      // Charger tous les blocs pour la gestion intégrée
      const { rows: blockRows } = await query("SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC");
      allBlocks = blockRows;
    }
    
    res.render("pages/block-form", { 
      title: block.type === 'header' ? "Paramètres de la page" : "Modifier un bloc", 
      formAction: `/blocks/${id}/edit`,
      block,
      pageSettings,
      fonts,
      allBlocks
    });
  } catch (error) {
    logger.error("Erreur récupération bloc", error);
    res.status(500).send("Erreur serveur");
  }
};

export const updateBlock = crudActionWrapper(
  async (req, res) => {
    const { id } = req.params;
    const { 
      type, title, slug, position, header_title, header_logo, bg_image,
      // Page theme settings (3 zones: header, main, footer)
      header_bg_image, header_bg_color, header_title_color,
      main_bg_image, main_bg_color, main_title_color,
      footer_bg_image, footer_bg_color, footer_text_color,
      // Global title font
      title_font_id,
      // Block theme settings
      is_transparent, block_bg_color, block_title_font, block_title_color
    } = req.body;
    
    // Récupérer le type de bloc actuel
    const { rows: currentBlock } = await query("SELECT type FROM blocks WHERE id=$1", [id]);
    if (currentBlock.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    const blockType = currentBlock[0].type;
    
    // Pour les blocs header, on met à jour les champs spécifiques + paramètres de la page
    if (blockType === 'header') {
      if (!header_title) {
        return res.status(400).send("Le titre du site est requis pour le header");
      }
      
      // Mise à jour du bloc header
      await query(
        "UPDATE blocks SET header_title=$1, header_logo=$2, bg_image=$3 WHERE id=$4",
        [header_title, header_logo || null, bg_image || null, id]
      );
      
      // Mise à jour des paramètres de la page (thème global simplifié)
      await query(
        `UPDATE page SET 
          header_bg_image=$1, header_bg_color=$2, header_title_color=$3,
          main_bg_image=$4, main_bg_color=$5, main_title_color=$6,
          footer_bg_image=$7, footer_bg_color=$8, footer_text_color=$9,
          title_font_id=$10,
          updated_at=NOW() 
        WHERE id=1`,
        [
          header_bg_image || null, header_bg_color || '#ffffff', header_title_color || '#333333',
          main_bg_image || null, main_bg_color || '#f5f5f5', main_title_color || '#333333',
          footer_bg_image || null, footer_bg_color || '#2c3e50', footer_text_color || '#ecf0f1',
          title_font_id || 1
        ]
      );
    } else {
      // Pour les autres blocs, mise à jour standard + thème du bloc
      if (!type || !title || !slug) {
        return res.status(400).send("Type, titre et slug requis");
      }
      
      await query(
        `UPDATE blocks SET 
          type=$1, title=$2, slug=$3, position=$4, bg_image=$5,
          is_transparent=$6, bg_color=$7, title_font=$8, title_color=$9
        WHERE id=$10`,
        [
          type, title, slug, position || 999, bg_image || null,
          is_transparent === 'true' || is_transparent === true, 
          block_bg_color || null, 
          block_title_font || null, 
          block_title_color || null,
          id
        ]
      );
    }
  },
  {
    successMessage: SUCCESS_MESSAGES.BLOCK_UPDATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "updateBlock",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.id}/edit`
  }
);

export const deleteBlock = crudActionWrapper(
  async (req) => {
    const { id } = req.params;
    
    // Vérifier que le bloc peut être supprimé (délégué au service)
    const { canDelete, reason } = await canDeleteBlock(id);
    if (!canDelete) {
      throw new Error(reason || ERROR_MESSAGES.BLOCK_NOT_FOUND);
    }
    
    await query("DELETE FROM blocks WHERE id=$1", [id]);
  },
  {
    successMessage: SUCCESS_MESSAGES.BLOCK_DELETED,
    errorMessage: ERROR_MESSAGES.BLOCK_NOT_FOUND,
    logContext: "deleteBlock",
    redirectOnSuccess: "/",
    redirectOnError: "/"
  }
);

export const reorderBlocks = async (req, res) => {
  const { order } = req.body; // Format attendu: [{ id: 1, position: 1 }, { id: 2, position: 2 }, ...]
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Format de données invalide" });
  }
  try {
    // Récupérer le header et le footer pour les garder à leurs positions fixes
    const { rows: headerRows } = await query(
      "SELECT id FROM blocks WHERE type='header' LIMIT 1"
    );
    
    const { rows: footerRows } = await query(
      "SELECT id FROM blocks WHERE type='footer' LIMIT 1"
    );
    
    const headerId = headerRows.length > 0 ? headerRows[0].id : null;
    const footerId = footerRows.length > 0 ? footerRows[0].id : null;
    
    // Filtrer header et footer de l'ordre reçu (ne doivent jamais être déplacés)
    const orderWithoutFixed = order.filter(item => 
      item.id !== headerId && item.id !== footerId
    );
    
    // S'assurer que le header reste en première position
    if (headerId) {
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [1, headerId]);
    }
    
    // Mise à jour des positions pour les blocs mobiles (décalage de +1 si header existe)
    const startPosition = headerId ? 2 : 1;
    for (let i = 0; i < orderWithoutFixed.length; i++) {
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [
        startPosition + i, 
        orderWithoutFixed[i].id
      ]);
    }
    
    // S'assurer que le footer reste en dernière position
    if (footerId) {
      const maxPosition = startPosition + orderWithoutFixed.length;
      await query("UPDATE blocks SET position=$1 WHERE id=$2", [maxPosition, footerId]);
    }
    
    res.json({ success: true, message: "Ordre des blocs mis à jour" });
  } catch (error) {
    logger.error("Erreur réordonnancement blocs", error);
    res.status(500).json({ error: "Erreur lors du réordonnancement" });
  }
};
