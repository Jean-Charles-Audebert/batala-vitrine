/**
 * Controller pour gérer les éléments du footer
 */
import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { getAvailableSocialNetworks } from "../utils/socialIcons.js";
import { crudActionWrapper } from "../utils/controllerHelpers.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants.js";
import { validateAndBuildFooterContent } from "../utils/validators.js";

/**
 * Liste les éléments du footer
 */
export const listFooterElements = async (req, res) => {
  const { blockId } = req.params;
  
  try {
    // Vérifier que le bloc existe et est bien un footer
    const { rows: blockRows } = await query(
      "SELECT id, type, title FROM blocks WHERE id=$1 AND type='footer'",
      [blockId]
    );
    
    if (blockRows.length === 0) {
      return res.status(404).send("Bloc footer non trouvé");
    }
    
    // Récupérer les éléments du footer
    const { rows: elements } = await query(
      "SELECT id, type, position, content FROM footer_elements WHERE block_id=$1 ORDER BY position ASC",
      [blockId]
    );
    
    res.render("pages/footer-elements", {
      title: "Éléments du footer",
      block: blockRows[0],
      elements,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    logger.error("Erreur récupération éléments footer", error);
    res.status(500).send("Erreur serveur");
  }
};

/**
 * Affiche le formulaire de création d'un élément footer
 */
export const showNewFooterElementForm = async (req, res) => {
  const { blockId } = req.params;
  
  try {
    const { rows } = await query("SELECT id, title FROM blocks WHERE id=$1 AND type='footer'", [blockId]);
    if (rows.length === 0) {
      return res.status(404).send("Bloc footer non trouvé");
    }
    
    res.render("pages/footer-element-form", {
      title: "Créer un élément footer",
      formAction: `/blocks/${blockId}/footer-elements/new`,
      block: rows[0],
      element: null,
      availableNetworks: getAvailableSocialNetworks()
    });
  } catch (error) {
    logger.error("Erreur affichage formulaire élément footer", error);
    res.status(500).send("Erreur serveur");
  }
};

/**
 * Crée un nouvel élément footer
 */
export const createFooterElement = crudActionWrapper(
  async (req) => {
    const { blockId } = req.params;
    const { type } = req.body;
    
    // Valider et construire le contenu (délégué au validator)
    const content = validateAndBuildFooterContent(type, req.body);
    
    // Calculer la position
    const { rows: posRows } = await query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM footer_elements WHERE block_id=$1",
      [blockId]
    );
    const position = posRows[0].next_pos;
    
    // Insérer l'élément
    await query(
      "INSERT INTO footer_elements (block_id, type, position, content) VALUES ($1, $2, $3, $4)",
      [blockId, type, position, JSON.stringify(content)]
    );
    
    logger.info(`Élément footer créé: type=${type}, block_id=${blockId}`);
  },
  {
    successMessage: SUCCESS_MESSAGES.FOOTER_ELEMENT_CREATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "createFooterElement",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.blockId}/footer-elements`
  }
);

/**
 * Affiche le formulaire d'édition d'un élément footer
 */
export const showEditFooterElementForm = async (req, res) => {
  const { blockId, id } = req.params;
  
  try {
    const { rows: blockRows } = await query("SELECT id, title FROM blocks WHERE id=$1 AND type='footer'", [blockId]);
    if (blockRows.length === 0) {
      return res.status(404).send("Bloc footer non trouvé");
    }
    
    const { rows: elementRows } = await query(
      "SELECT id, type, position, content FROM footer_elements WHERE id=$1 AND block_id=$2",
      [id, blockId]
    );
    
    if (elementRows.length === 0) {
      return res.status(404).send("Élément non trouvé");
    }
    
    res.render("pages/footer-element-form", {
      title: "Modifier l'élément footer",
      formAction: `/blocks/${blockId}/footer-elements/${id}/edit`,
      block: blockRows[0],
      element: elementRows[0],
      availableNetworks: getAvailableSocialNetworks()
    });
  } catch (error) {
    logger.error("Erreur affichage formulaire édition élément footer", error);
    res.status(500).send("Erreur serveur");
  }
};

/**
 * Met à jour un élément footer
 */
export const updateFooterElement = crudActionWrapper(
  async (req) => {
    const { blockId, id } = req.params;
    const { type } = req.body;
    
    // Valider et construire le contenu (délégué au validator)
    const content = validateAndBuildFooterContent(type, req.body);
    
    await query(
      "UPDATE footer_elements SET type=$1, content=$2 WHERE id=$3 AND block_id=$4",
      [type, JSON.stringify(content), id, blockId]
    );
    
    logger.info(`Élément footer ${id} mis à jour`);
  },
  {
    successMessage: SUCCESS_MESSAGES.FOOTER_ELEMENT_UPDATED,
    errorMessage: ERROR_MESSAGES.DATABASE_ERROR,
    logContext: "updateFooterElement",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.blockId}/footer-elements/${req.params.id}/edit`
  }
);

/**
 * Supprime un élément footer
 */
export const deleteFooterElement = crudActionWrapper(
  async (req) => {
    const { blockId, id } = req.params;
    await query("DELETE FROM footer_elements WHERE id=$1 AND block_id=$2", [id, blockId]);
    logger.info(`Élément footer ${id} supprimé`);
  },
  {
    successMessage: SUCCESS_MESSAGES.FOOTER_ELEMENT_DELETED,
    errorMessage: ERROR_MESSAGES.FOOTER_ELEMENT_NOT_FOUND,
    logContext: "deleteFooterElement",
    redirectOnSuccess: "/",
    redirectOnError: (req) => `/blocks/${req.params.blockId}/footer-elements`
  }
);

/**
 * API JSON - Récupère un élément footer par type
 * GET /api/blocks/:blockId/footer-elements/:type
 */
export const getFooterElementJson = async (req, res) => {
  const { blockId, type } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, type, position, content FROM footer_elements WHERE block_id=$1 AND type=$2",
      [blockId, type]
    );
    if (rows.length === 0) {
      return res.json({ success: true, element: null });
    }
    res.json({ success: true, element: rows[0] });
  } catch (error) {
    logger.error("Erreur API getFooterElementJson", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * API JSON - Liste tous les éléments footer d'un type
 * GET /api/blocks/:blockId/footer-elements/list/:type
 */
export const listFooterElementsJson = async (req, res) => {
  const { blockId, type } = req.params;
  try {
    const { rows } = await query(
      "SELECT id, type, position, content FROM footer_elements WHERE block_id=$1 AND type=$2 ORDER BY position ASC",
      [blockId, type]
    );
    res.json({ success: true, elements: rows });
  } catch (error) {
    logger.error("Erreur API listFooterElementsJson", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * API JSON - Met à jour ou crée un élément footer
 * POST /api/blocks/:blockId/footer-elements/:type
 */
export const upsertFooterElementJson = async (req, res) => {
  const { blockId, type } = req.params;
  try {
    // Valider et construire le contenu
    const content = validateAndBuildFooterContent(type, req.body);
    
    // Vérifier si l'élément existe déjà (pour text et contact, un seul par bloc)
    if (type === 'text' || type === 'contact') {
      const { rows: existing } = await query(
        "SELECT id FROM footer_elements WHERE block_id=$1 AND type=$2",
        [blockId, type]
      );
      
      if (existing.length > 0) {
        // Update
        await query(
          "UPDATE footer_elements SET content=$1 WHERE id=$2 AND block_id=$3",
          [JSON.stringify(content), existing[0].id, blockId]
        );
        logger.info(`Élément footer ${type} mis à jour (block_id=${blockId})`);
        return res.json({ success: true, message: SUCCESS_MESSAGES.FOOTER_ELEMENT_UPDATED });
      }
    }
    
    // Insert (nouveau)
    const { rows: posRows } = await query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM footer_elements WHERE block_id=$1",
      [blockId]
    );
    const position = posRows[0].next_pos;
    
    await query(
      "INSERT INTO footer_elements (block_id, type, position, content) VALUES ($1, $2, $3, $4)",
      [blockId, type, position, JSON.stringify(content)]
    );
    
    logger.info(`Élément footer ${type} créé (block_id=${blockId})`);
    res.status(201).json({ success: true, message: SUCCESS_MESSAGES.FOOTER_ELEMENT_CREATED });
  } catch (error) {
    logger.error("Erreur API upsertFooterElementJson", error);
    res.status(500).json({ success: false, message: error.message || ERROR_MESSAGES.DATABASE_ERROR });
  }
};

/**
 * API JSON - Supprime un élément footer
 * DELETE /api/blocks/:blockId/footer-elements/:id
 */
export const deleteFooterElementJson = async (req, res) => {
  const { blockId, id } = req.params;
  try {
    await query("DELETE FROM footer_elements WHERE id=$1 AND block_id=$2", [id, blockId]);
    logger.info(`Élément footer ${id} supprimé (API JSON)`);
    res.json({ success: true, message: SUCCESS_MESSAGES.FOOTER_ELEMENT_DELETED });
  } catch (error) {
    logger.error("Erreur API deleteFooterElementJson", error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.DATABASE_ERROR });
  }
};
