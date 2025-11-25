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

    // Pour chaque section, charger ses éléments et extraire le type
    const sectionsWithElements = await Promise.all(
      sections.map(async (section) => {
        const elements = await loadSectionElements(section.id);
        const type = section.settings?.type || 'unknown';
        return {
          ...section,
          type,
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
    const type = section.settings?.type || 'unknown';

    return {
      ...section,
      type,
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
    ORDER BY position ASC, id ASC
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
      title,
      show_title = true,
      is_visible = true,
      layout,
      settings = {}
    } = sectionData;

    // Ajouter le type aux settings si fourni
    const finalSettings = { ...settings };
    if (type) {
      finalSettings.type = type;
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
        title, show_title, is_visible, position, layout, settings
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      title, show_title, is_visible, position, layout, JSON.stringify(finalSettings)
    ]);

    logger.info(`Section créée: #${rows[0].id} (${type || 'unknown'}) à la position ${position}`);
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
      title,
      show_title,
      is_visible,
      layout,
      settings,
      type
    } = sectionData;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Champs de base
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (show_title !== undefined) {
      updates.push(`show_title = $${paramIndex++}`);
      values.push(show_title);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }
    if (layout !== undefined) {
      updates.push(`layout = $${paramIndex++}`);
      values.push(layout);
    }

    // Gérer le settings complet
    if (settings !== undefined) {
      const finalSettings = { ...settings };
      if (type !== undefined) {
        finalSettings.type = type;
      }
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(finalSettings));
    } else if (type !== undefined) {
      // Si seulement type est fourni, mettre à jour le settings existant
      const { rows: currentRows } = await query('SELECT settings FROM sections WHERE id = $1', [sectionId]);
      const currentSettings = currentRows[0]?.settings || {};
      const updatedSettings = { ...currentSettings, type };

      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(updatedSettings));
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
