import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { crudActionWrapper } from "../utils/controllerHelpers.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants.js";
import { getBlockBasicInfo } from "../services/index.js";

/**
 * Liste toutes les cartes d'un bloc donné
 */
export const listCards = async (req, res) => {
  const { blockId } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, block_id, position, title, description, media_path, event_date FROM cards WHERE block_id=$1 ORDER BY position ASC",
      [blockId]
    );
    
    // Récupérer aussi les infos du bloc
    const block = await getBlockBasicInfo(blockId);
    
    if (!block) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    res.render("pages/cards", {
      title: `Cartes du bloc "${block.title}"`,
      block,
      cards: rows,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    logger.error("Erreur récupération cartes", error);
    res.status(500).send("Erreur lors de la récupération des cartes");
  }
};

/**
 * Affiche le formulaire de création d'une carte
 */
export const showNewCardForm = async (req, res) => {
  const { blockId } = req.params;
  try {
    const block = await getBlockBasicInfo(blockId);
    if (!block) {
      return res.status(404).send("Bloc non trouvé");
    }
    res.render("pages/card-form", {
      title: "Créer une nouvelle carte",
      formAction: `/blocks/${blockId}/cards/new`,
      block,
      card: null
    });
  } catch (error) {
    logger.error("Erreur affichage formulaire carte", error);
    res.status(500).send("Erreur serveur");
  }
};

/**
 * Crée une nouvelle carte
 */
export const createCard = crudActionWrapper(
  async (req, res) => {
    const { blockId } = req.params;
    const { title, description, media_path, event_date, position } = req.body;
    
    if (!title) {
      return res.render("pages/card-form", {
        title: "Créer une nouvelle carte",
        formAction: `/blocks/${blockId}/cards/new`,
        block: { id: blockId },
        card: null,
        error: "Le titre est requis."
      });
    }
    
    await query(
      "INSERT INTO cards (block_id, title, description, media_path, event_date, position) VALUES ($1, $2, $3, $4, $5, $6)",
      [blockId, title, description || null, media_path || null, event_date || null, position || 999]
    );
  },
  {
    successMessage: SUCCESS_MESSAGES.CARD_CREATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "createCard",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.blockId}/cards/new`
  }
);

/**
 * Affiche le formulaire d'édition d'une carte
 */
export const showEditCardForm = async (req, res) => {
  const { blockId, id } = req.params;
  try {
    const { rows: cardRows } = await query(
      "SELECT * FROM cards WHERE id=$1 AND block_id=$2",
      [id, blockId]
    );
    if (cardRows.length === 0) {
      return res.status(404).send("Carte non trouvée");
    }
    
    const block = await getBlockBasicInfo(blockId);
    
    res.render("pages/card-form", {
      title: "Modifier une carte",
      formAction: `/blocks/${blockId}/cards/${id}/edit`,
      block,
      card: cardRows[0]
    });
  } catch (error) {
    logger.error("Erreur récupération carte", error);
    res.status(500).send("Erreur serveur");
  }
};

/**
 * Met à jour une carte
 */
export const updateCard = crudActionWrapper(
  async (req, res) => {
    const { blockId, id } = req.params;
    const { title, description, media_path, event_date, position } = req.body;
    
    if (!title) {
      return res.status(400).send("Le titre est requis");
    }
    
    await query(
      "UPDATE cards SET title=$1, description=$2, media_path=$3, event_date=$4, position=$5, updated_at=NOW() WHERE id=$6 AND block_id=$7",
      [title, description || null, media_path || null, event_date || null, position || 999, id, blockId]
    );
  },
  {
    successMessage: SUCCESS_MESSAGES.CARD_UPDATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "updateCard",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.blockId}/cards/${req.params.id}/edit`
  }
);

/**
 * Supprime une carte
 */
export const deleteCard = crudActionWrapper(
  async (req) => {
    const { blockId, id } = req.params;
    await query("DELETE FROM cards WHERE id=$1 AND block_id=$2", [id, blockId]);
  },
  {
    successMessage: SUCCESS_MESSAGES.CARD_DELETED,
    errorMessage: ERROR_MESSAGES.CARD_NOT_FOUND,
    logContext: "deleteCard",
    redirectOnSuccess: "/",
    redirectOnError: "/"
  }
);

/**
 * Réordonne les cartes d'un bloc (API JSON)
 */
export const reorderCards = async (req, res) => {
  const { blockId } = req.params;
  const { order } = req.body;
  
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Format de données invalide" });
  }
  
  try {
    for (const item of order) {
      await query(
        "UPDATE cards SET position=$1 WHERE id=$2 AND block_id=$3",
        [item.position, item.id, blockId]
      );
    }
    res.json({ success: true, message: "Ordre des cartes mis à jour" });
  } catch (error) {
    logger.error("Erreur réordonnancement cartes", error);
    res.status(500).json({ error: "Erreur lors du réordonnancement" });
  }
};

/**
 * API JSON - Récupère une carte par id pour édition inline
 * GET /api/blocks/:blockId/cards/:id
 */
export const getCardJson = async (req, res) => {
  const { blockId, id } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, block_id, position, title, description, media_path, event_date FROM cards WHERE id=$1 AND block_id=$2",
      [id, blockId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Carte non trouvée" });
    }
    res.json({ success: true, card: rows[0] });
  } catch (error) {
    logger.error("Erreur API getCardJson", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * API JSON - Met à jour une carte (édition inline)
 * POST /api/blocks/:blockId/cards/:id
 */
export const updateCardJson = async (req, res) => {
  const { blockId, id } = req.params;
  const { title, description, media_path, event_date, position } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Le titre est requis" });
  }
  try {
    const { rows } = await query(
      "UPDATE cards SET title=$1, description=$2, media_path=$3, event_date=$4, position=COALESCE($5, position), updated_at=NOW() WHERE id=$6 AND block_id=$7 RETURNING id, block_id, position, title, description, media_path, event_date",
      [title.trim(), description || null, media_path || null, event_date || null, position || null, id, blockId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Carte non trouvée" });
    }
    res.json({ success: true, message: SUCCESS_MESSAGES.CARD_UPDATED, card: rows[0] });
  } catch (error) {
    logger.error("Erreur API updateCardJson", error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.DATABASE_ERROR });
  }
};

/**
 * API JSON - Crée une carte (création rapide depuis modale)
 * POST /api/blocks/:blockId/cards
 */
export const createCardJson = async (req, res) => {
  const { blockId } = req.params;
  const { title, description, media_path, event_date, position } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Le titre est requis" });
  }
  try {
    const { rows } = await query(
      "INSERT INTO cards (block_id, title, description, media_path, event_date, position) VALUES ($1, $2, $3, $4, $5, COALESCE($6, 999)) RETURNING id, block_id, position, title, description, media_path, event_date",
      [blockId, title.trim(), description || null, media_path || null, event_date || null, position || null]
    );
    res.status(201).json({ success: true, message: SUCCESS_MESSAGES.CARD_CREATED, card: rows[0] });
  } catch (error) {
    logger.error("Erreur API createCardJson", error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.DATABASE_ERROR });
  }
};

