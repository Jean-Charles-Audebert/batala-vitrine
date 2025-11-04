import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";

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
    const { rows: blockRows } = await query(
      "SELECT id, type, title FROM blocks WHERE id=$1",
      [blockId]
    );
    
    if (blockRows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    
    res.render("pages/cards", {
      title: `Cartes du bloc "${blockRows[0].title}"`,
      block: blockRows[0],
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
    const { rows } = await query("SELECT id, type, title FROM blocks WHERE id=$1", [blockId]);
    if (rows.length === 0) {
      return res.status(404).send("Bloc non trouvé");
    }
    res.render("pages/card-form", {
      title: "Créer une nouvelle carte",
      formAction: `/blocks/${blockId}/cards/new`,
      block: rows[0],
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
export const createCard = async (req, res) => {
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
  
  try {
    await query(
      "INSERT INTO cards (block_id, title, description, media_path, event_date, position) VALUES ($1, $2, $3, $4, $5, $6)",
      [blockId, title, description || null, media_path || null, event_date || null, position || 999]
    );
    res.redirect(`/blocks/${blockId}/cards?success=Carte créée avec succès`);
  } catch (error) {
    logger.error("Erreur création carte", error);
    res.render("pages/card-form", {
      title: "Créer une nouvelle carte",
      formAction: `/blocks/${blockId}/cards/new`,
      block: { id: blockId },
      card: { title, description, media_path, event_date, position },
      error: "Erreur lors de la création de la carte"
    });
  }
};

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
    
    const { rows: blockRows } = await query("SELECT id, type, title FROM blocks WHERE id=$1", [blockId]);
    
    res.render("pages/card-form", {
      title: "Modifier une carte",
      formAction: `/blocks/${blockId}/cards/${id}/edit`,
      block: blockRows[0],
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
export const updateCard = async (req, res) => {
  const { blockId, id } = req.params;
  const { title, description, media_path, event_date, position } = req.body;
  
  if (!title) {
    return res.status(400).send("Le titre est requis");
  }
  
  try {
    await query(
      "UPDATE cards SET title=$1, description=$2, media_path=$3, event_date=$4, position=$5, updated_at=NOW() WHERE id=$6 AND block_id=$7",
      [title, description || null, media_path || null, event_date || null, position || 999, id, blockId]
    );
    res.redirect(`/blocks/${blockId}/cards?success=Carte modifiée avec succès`);
  } catch (error) {
    logger.error("Erreur modification carte", error);
    res.status(500).send("Erreur lors de la modification");
  }
};

/**
 * Supprime une carte
 */
export const deleteCard = async (req, res) => {
  const { blockId, id } = req.params;
  try {
    await query("DELETE FROM cards WHERE id=$1 AND block_id=$2", [id, blockId]);
    res.redirect(`/blocks/${blockId}/cards?success=Carte supprimée avec succès`);
  } catch (error) {
    logger.error("Erreur suppression carte", error);
    res.status(500).send("Erreur lors de la suppression");
  }
};

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
