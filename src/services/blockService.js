/**
 * Service pour les opérations DB courantes sur les blocs
 */
import { query } from "../config/db.js";

/**
 * Récupère un bloc par son ID
 * @param {number} blockId - ID du bloc
 * @returns {Promise<Object|null>} - Le bloc ou null
 */
export async function getBlockById(blockId) {
  const { rows } = await query(
    "SELECT * FROM blocks WHERE id = $1",
    [blockId]
  );
  return rows[0] || null;
}

/**
 * Récupère tous les blocs ordonnés par position
 * @returns {Promise<Array>} - Liste des blocs
 */
export async function getAllBlocks() {
  const { rows } = await query(
    "SELECT id, type, title, slug, position, header_logo, header_title, bg_image FROM blocks ORDER BY position ASC"
  );
  return rows;
}

/**
 * Met à jour la position d'un bloc
 * @param {number} blockId - ID du bloc
 * @param {number} position - Nouvelle position
 */
export async function updateBlockPosition(blockId, position) {
  await query(
    "UPDATE blocks SET position = $1 WHERE id = $2",
    [position, blockId]
  );
}

/**
 * Supprime un bloc
 * @param {number} blockId - ID du bloc
 */
export async function deleteBlockById(blockId) {
  await query("DELETE FROM blocks WHERE id = $1", [blockId]);
}

/**
 * Calcule la position optimale pour un nouveau bloc
 * Logique: insérer après le header et avant le footer
 * 
 * @param {number|null} requestedPosition - Position demandée (null pour auto)
 * @returns {Promise<number>} - Position calculée
 */
export async function calculateBlockPosition(requestedPosition = null) {
  // Si une position est explicitement demandée, l'utiliser
  if (requestedPosition) {
    return requestedPosition;
  }
  
  // Sinon, calculer la position intelligemment
  const { rows: headerRows } = await query(
    "SELECT position FROM blocks WHERE type='header' ORDER BY position ASC LIMIT 1"
  );
  
  const { rows: footerRows } = await query(
    "SELECT position FROM blocks WHERE type='footer' ORDER BY position DESC LIMIT 1"
  );
  
  if (footerRows.length > 0) {
    // Insérer juste avant le footer
    const footerPosition = footerRows[0].position;
    
    // Décaler le footer et les blocs après
    await query(
      "UPDATE blocks SET position = position + 1 WHERE position >= $1",
      [footerPosition]
    );
    
    return footerPosition;
  } else if (headerRows.length > 0) {
    // Pas de footer, insérer après le header
    const headerPosition = headerRows[0].position;
    
    // Décaler les blocs après le header
    await query(
      "UPDATE blocks SET position = position + 1 WHERE position > $1",
      [headerPosition]
    );
    
    return headerPosition + 1;
  } else {
    // Ni header ni footer, mettre à la fin
    const { rows: maxRows } = await query(
      "SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM blocks"
    );
    return maxRows[0].next_pos;
  }
}

/**
 * Vérifie si un bloc peut être supprimé (non verrouillé)
 * @param {number} blockId - ID du bloc
 * @returns {Promise<{canDelete: boolean, reason?: string}>}
 */
export async function canDeleteBlock(blockId) {
  const { rows } = await query("SELECT is_locked FROM blocks WHERE id=$1", [blockId]);
  
  if (rows.length === 0) {
    return { canDelete: false, reason: "Bloc non trouvé" };
  }
  
  if (rows[0].is_locked) {
    return { canDelete: false, reason: "Impossible de supprimer un bloc verrouillé" };
  }
  
  return { canDelete: true };
}

/**
 * Récupère un bloc avec validation minimale (id, type, title)
 * Utile pour vérifier l'existence et le type avant une opération
 * @param {number} blockId - ID du bloc
 * @param {string|null} expectedType - Type attendu (null pour tout type)
 * @returns {Promise<Object|null>} - Le bloc ou null
 */
export async function getBlockBasicInfo(blockId, expectedType = null) {
  const query_text = expectedType
    ? "SELECT id, type, title FROM blocks WHERE id=$1 AND type=$2"
    : "SELECT id, type, title FROM blocks WHERE id=$1";
  
  const params = expectedType ? [blockId, expectedType] : [blockId];
  
  const { rows } = await query(query_text, params);
  return rows[0] || null;
}
