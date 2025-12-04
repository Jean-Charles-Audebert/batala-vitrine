import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/sections
 * Liste toutes les sections
 */
export const getSections = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT * FROM sections
      ORDER BY position ASC NULLS LAST, id ASC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    logger.error('Erreur récupération sections:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * GET /api/sections/:id
 * Récupère une section avec ses éléments
 */
export const getSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la section
    const { rows: sections } = await query(
      'SELECT * FROM sections WHERE id = $1',
      [id]
    );

    if (sections.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section non trouvée'
      });
    }

    const section = sections[0];

    // Récupérer les éléments de la section
    const { rows: elements } = await query(`
      SELECT * FROM elements
      WHERE section_id = $1
      ORDER BY position ASC, id ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...section,
        elements
      }
    });
  } catch (error) {
    logger.error('Erreur récupération section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * POST /api/sections
 * Crée une nouvelle section
 */
export const createSection = async (req, res) => {
  try {
    const { title, show_title, is_visible, position, layout, type, settings } = req.body;

    const { rows } = await query(`
      INSERT INTO sections (page_id, type, title, show_title, is_visible, position, layout, settings)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      1,  // page_id - pour l'instant toujours 1 (une seule page par site)
      type || 'standard',
      title || '',
      show_title ?? true,
      is_visible ?? true,
      position ?? 0,
      layout || '',
      JSON.stringify(settings || {})
    ]);

    res.status(201).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur création section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    });
  }
};

/**
 * PUT /api/sections/:id
 * Met à jour une section
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, show_title, is_visible, position, layout, type, settings } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Construire les champs à mettre à jour
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (show_title !== undefined) {
      updateFields.push(`show_title = $${paramIndex++}`);
      values.push(show_title);
    }
    if (is_visible !== undefined) {
      updateFields.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }
    if (position !== undefined) {
      updateFields.push(`position = $${paramIndex++}`);
      values.push(position);
    }
    if (layout !== undefined) {
      updateFields.push(`layout = $${paramIndex++}`);
      values.push(layout);
    }
    if (type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (settings !== undefined) {
      updateFields.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée à mettre à jour'
      });
    }

    values.push(id);

    const { rows } = await query(`
      UPDATE sections
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur mise à jour section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    });
  }
};

/**
 * DELETE /api/sections/:id
 * Supprime une section et ses éléments
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer d'abord les éléments de la section
    await query('DELETE FROM elements WHERE section_id = $1', [id]);

    // Puis supprimer la section
    const { rowCount } = await query('DELETE FROM sections WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Section non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Section supprimée'
    });
  } catch (error) {
    logger.error('Erreur suppression section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};