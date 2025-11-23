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

    // Pour chaque section, charger ses éléments et décorations
    const sectionsWithElements = await Promise.all(
      sections.map(async (section) => {
        const elements = await loadSectionElements(section.id);
        const decorations = await loadSectionDecorations(section.id);
        return {
          ...section,
          elements,
          decorations
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
    const decorations = await loadSectionDecorations(sectionId);

    return {
      ...section,
      elements,
      decorations
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
 * Charger les décorations d'une section
 */
async function loadSectionDecorations(sectionId) {
  const { rows } = await query(`
    SELECT d.*, sd.position, sd.color, sd.opacity, sd.scale
    FROM decorations d
    JOIN section_decorations sd ON d.id = sd.decoration_id
    WHERE sd.section_id = $1 AND d.is_active = TRUE
    ORDER BY sd.position ASC
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
      position,
      is_visible = true,
      layout,
      settings = {},
      padding_top = 'medium',
      padding_bottom = 'medium'
    } = sectionData;

    // Calculer la position automatiquement si non fournie
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      const { rows: maxPosRows } = await query(`
        SELECT COALESCE(MAX(position), 0) as max_pos
        FROM sections
        WHERE position < 999
      `);
      finalPosition = maxPosRows[0].max_pos + 1;
    }

    const { rows } = await query(`
      INSERT INTO sections (
        type, title, position, is_visible, layout,
        padding_top, padding_bottom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      type, title, finalPosition, is_visible, layout,
      padding_top, padding_bottom
    ]);

    logger.info(`Section créée: #${rows[0].id} (${type}) à la position ${finalPosition}`);
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
      position,
      is_visible,
      layout,
      settings,
      padding_top,
      padding_bottom,
      bg_color,
      bg_image,
      bg_video,
      bg_youtube,
      is_transparent
    } = sectionData;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Champs de base
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }
    if (layout !== undefined) {
      updates.push(`layout = $${paramIndex++}`);
      values.push(layout);
    }
    if (settings !== undefined) {
      // Note: settings column may not exist in current schema
      // Settings are handled at element level now
      logger.info('Settings update skipped - handled at element level');
    }
    if (padding_top !== undefined) {
      updates.push(`padding_top = $${paramIndex++}`);
      values.push(padding_top);
    }
    if (padding_bottom !== undefined) {
      updates.push(`padding_bottom = $${paramIndex++}`);
      values.push(padding_bottom);
    }
    if (bg_color !== undefined) {
      updates.push(`bg_color = $${paramIndex++}`);
      values.push(bg_color);
    }
    if (bg_image !== undefined) {
      updates.push(`bg_image = $${paramIndex++}`);
      values.push(bg_image);
    }
    if (bg_video !== undefined) {
      updates.push(`bg_video = $${paramIndex++}`);
      values.push(bg_video);
    }
    if (bg_youtube !== undefined) {
      updates.push(`bg_youtube = $${paramIndex++}`);
      values.push(bg_youtube);
    }
    if (is_transparent !== undefined) {
      updates.push(`is_transparent = $${paramIndex++}`);
      values.push(is_transparent);
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
 * Récupérer toutes les décorations disponibles
 */
export const getAllDecorations = async () => {
  try {
    const { rows } = await query(`
      SELECT
        id, name, display_name, type, description,
        svg_code, default_color, default_opacity, default_scale,
        supported_positions, preview_url
      FROM decorations
      WHERE is_active = TRUE
      ORDER BY type, display_name
    `);

    return rows;
  } catch (error) {
    logger.error('Erreur getAllDecorations:', error);
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

/**
 * Ajouter une décoration à une section
 */
export const addSectionDecoration = async (sectionId, decorationData) => {
  try {
    const { decoration_id, position = 0, color, opacity, scale } = decorationData;

    const { rows } = await query(`
      INSERT INTO section_decorations (section_id, decoration_id, position, color, opacity, scale)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [sectionId, decoration_id, position, color, opacity, scale]);

    return rows[0];
  } catch (error) {
    logger.error('Erreur addSectionDecoration:', error);
    throw error;
  }
};
