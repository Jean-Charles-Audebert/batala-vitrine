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
      "SELECT id, type, title, slug, position, is_locked, bg_image, header_logo, header_title FROM blocks WHERE id=$1", 
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    res.render("pages/block-form", { 
      title: "Modifier un bloc", 
      formAction: `/blocks/${id}/edit`,
      block: rows[0]
    });
  } catch (error) {
    logger.error("Erreur récupération bloc", error);
    res.status(500).send("Erreur serveur");
  }
};

export const updateBlock = crudActionWrapper(
  async (req, res) => {
    const { id } = req.params;
    const { type, title, slug, position, header_title, header_logo, bg_image } = req.body;
    
    // Récupérer le type de bloc actuel
    const { rows: currentBlock } = await query("SELECT type FROM blocks WHERE id=$1", [id]);
    if (currentBlock.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    const blockType = currentBlock[0].type;
    
    // Pour les blocs header, on met à jour les champs spécifiques
    if (blockType === 'header') {
      if (!header_title) {
        return res.status(400).send("Le titre du site est requis pour le header");
      }
      
      await query(
        "UPDATE blocks SET header_title=$1, header_logo=$2, bg_image=$3 WHERE id=$4",
        [header_title, header_logo || null, bg_image || null, id]
      );
    } else {
      // Pour les autres blocs, mise à jour standard
      if (!type || !title || !slug) {
        return res.status(400).send("Type, titre et slug requis");
      }
      
      await query(
        "UPDATE blocks SET type=$1, title=$2, slug=$3, position=$4, bg_image=$5 WHERE id=$6",
        [type, title, slug, position || 999, bg_image || null, id]
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
