/**
 * Service pour les opérations DB courantes sur les cartes
 */
import { query } from "../config/db.js";

/**
 * Récupère une carte par son ID
 * @param {number} cardId - ID de la carte
 * @returns {Promise<Object|null>} - La carte ou null
 */
export async function getCardById(cardId) {
  const { rows } = await query(
    "SELECT * FROM cards WHERE id = $1",
    [cardId]
  );
  return rows[0] || null;
}

/**
 * Récupère toutes les cartes d'un bloc
 * @param {number} blockId - ID du bloc
 * @returns {Promise<Array>} - Liste des cartes
 */
export async function getCardsByBlockId(blockId) {
  const { rows } = await query(
    "SELECT * FROM cards WHERE block_id = $1 ORDER BY position ASC",
    [blockId]
  );
  return rows;
}

/**
 * Met à jour la position d'une carte
 * @param {number} cardId - ID de la carte
 * @param {number} position - Nouvelle position
 */
export async function updateCardPosition(cardId, position) {
  await query(
    "UPDATE cards SET position = $1 WHERE id = $2",
    [position, cardId]
  );
}

/**
 * Supprime une carte
 * @param {number} cardId - ID de la carte
 */
export async function deleteCardById(cardId) {
  await query("DELETE FROM cards WHERE id = $1", [cardId]);
}
