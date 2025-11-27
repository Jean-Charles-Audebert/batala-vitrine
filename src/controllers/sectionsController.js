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
    const validatedData = createSectionSchema.parse(req.body);

    const { rows } = await query(`
      INSERT INTO sections (title, show_title, is_visible, position, layout, settings)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      validatedData.title,
      validatedData.show_title ?? true,
      validatedData.is_visible ?? true,
      validatedData.position ?? 0,
      validatedData.layout,
      validatedData.settings
    ]);

    res.status(201).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }

    logger.error('Erreur création section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
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
    const validatedData = updateSectionSchema.parse(req.body);

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(validatedData[key]);
        paramIndex++;
      }
    });

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
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors
      });
    }

    logger.error('Erreur mise à jour section:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
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