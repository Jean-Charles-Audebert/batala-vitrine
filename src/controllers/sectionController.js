/**
 * Section Controller
 * Gestion CRUD des sections modulaires avec elements (JSONB)
 */

import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Récupérer toutes les sections avec leurs éléments
 */
export const getAllSections = async () => {
  try {
    // Récupérer toutes les sections visibles
    const { rows: sections } = await query(`
      SELECT * FROM sections
      WHERE is_visible = TRUE
      ORDER BY position ASC NULLS LAST, id ASC
    `);

    // Pour chaque section, charger ses éléments
    const sectionsWithElements = await Promise.all(
      sections.map(async (section) => {
        const elements = await loadSectionElements(section.id);
        return {
          ...section,
          elements
        };
      })
    );

    return sectionsWithElements;
  } catch (error) {
    logger.error('Erreur getAllSections:', error);
    throw error;
  }
};

/**
 * Récupérer une section par ID avec ses éléments
 */
export const getSectionById = async (sectionId) => {
  try {
    const { rows } = await query('SELECT * FROM sections WHERE id = $1', [sectionId]);

    if (rows.length === 0) {
      return null;
    }

    const section = rows[0];
    const elements = await loadSectionElements(sectionId);

    return {
      ...section,
      elements
    };
  } catch (error) {
    logger.error('Erreur getSectionById:', error);
    throw error;
  }
};

/**
 * Charger les éléments d'une section
 */
async function loadSectionElements(sectionId) {
  const { rows } = await query(`
    SELECT * FROM elements
    WHERE section_id = $1
    ORDER BY col_start ASC, id ASC
  `, [sectionId]);

  return rows;
}

/**
 * Créer une nouvelle section
 */
export const createSection = async (sectionData) => {
  try {
    const {
      type,
      page_id = 1, // Valeur par défaut pour les tests
      is_visible = true,
      settings = {}
    } = sectionData;

    // Validation
    if (!type) {
      throw new Error('Le type de section est requis');
    }
    if (!page_id) {
      throw new Error('Le page_id est requis');
    }

    // Calculer la position automatiquement
    const { rows: maxPosRows } = await query(`
      SELECT COALESCE(MAX(position), 0) as max_pos
      FROM sections
      WHERE position < 999
    `);
    const position = maxPosRows[0].max_pos + 1;

    const { rows } = await query(`
      INSERT INTO sections (
        type, page_id, is_visible, position, settings
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      type, page_id, is_visible, position, JSON.stringify(settings)
    ]);

    logger.info(`Section créée: #${rows[0].id} (${type}) à la position ${position}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur createSection:', error);
    throw error;
  }
};

/**
 * Mettre à jour une section
 */
export const updateSection = async (sectionId, sectionData) => {
  try {
    const {
      type,
      is_visible,
      position,
      settings
    } = sectionData;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Champs de base
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position);
    }

    // Gérer le settings complet
    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      const { rows } = await query('SELECT * FROM sections WHERE id = $1', [sectionId]);
      return rows[0] || null;
    }

    updates.push(`updated_at = NOW()`);
    values.push(sectionId);

    const { rows } = await query(`
      UPDATE sections SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (rows.length === 0) {
      return null;
    }

    logger.info(`Section mise à jour: #${sectionId}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur updateSection:', error);
    throw error;
  }
};

/**
 * Supprimer une section et ses éléments
 */
export const deleteSection = async (sectionId) => {
  try {
    // Supprimer d'abord les éléments
    await query('DELETE FROM elements WHERE section_id = $1', [sectionId]);

    // Puis supprimer la section
    const { rowCount } = await query('DELETE FROM sections WHERE id = $1', [sectionId]);

    const deleted = rowCount > 0;
    if (deleted) {
      logger.info(`Section supprimée: #${sectionId}`);
    }
    return deleted;
  } catch (error) {
    logger.error('Erreur deleteSection:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les polices disponibles
 */
export const getAllFonts = async () => {
  try {
    const { rows } = await query(`
      SELECT
        id, name, display_name, source, url, font_family, file_path
      FROM fonts
      ORDER BY source, name
    `);

    return rows;
  } catch (error) {
    logger.error('Erreur getAllFonts:', error);
    throw error;
  }
};
