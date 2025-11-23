import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import {
  pageSchema,
  updatePageSchema
} from '../config/schemas.js';

/**
 * GET /api/page
 * Récupère les paramètres globaux de la page
 */
export const getPage = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM page LIMIT 1');

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Page non trouvée'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur récupération page:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * PUT /api/page
 * Met à jour les paramètres globaux de la page
 */
export const updatePage = async (req, res) => {
  try {
    const validatedData = updatePageSchema.parse(req.body);

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

    const { rows } = await query(`
      UPDATE page
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Page non trouvée'
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

    logger.error('Erreur mise à jour page:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};