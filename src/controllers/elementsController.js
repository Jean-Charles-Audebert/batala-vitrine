import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import {
  createElementSchema,
  updateElementSchema
} from '../config/schemas.js';

/**
 * GET /api/elements?section_id=:sectionId
 * Liste les éléments (tous ou filtrés par section)
 */
export const getElements = async (req, res) => {
  try {
    const { section_id } = req.query;
    let queryText = 'SELECT * FROM elements';
    const values = [];

    if (section_id) {
      queryText += ' WHERE section_id = $1';
      values.push(section_id);
    }

    queryText += ' ORDER BY section_id ASC, position ASC, id ASC';

    const { rows } = await query(queryText, values);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    logger.error('Erreur récupération éléments:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * GET /api/elements/:id
 * Récupère un élément
 */
export const getElement = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query(
      'SELECT * FROM elements WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur récupération élément:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * POST /api/elements
 * Crée un nouvel élément
 */
export const createElement = async (req, res) => {
  try {
    const validatedData = createElementSchema.parse(req.body);

    const { rows } = await query(`
      INSERT INTO elements (section_id, type, title, position, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      validatedData.section_id,
      validatedData.type,
      validatedData.title,
      validatedData.position ?? 0,
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

    logger.error('Erreur création élément:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * PUT /api/elements/:id
 * Met à jour un élément
 */
export const updateElement = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateElementSchema.parse(req.body);

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
      UPDATE elements
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé'
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

    logger.error('Erreur mise à jour élément:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * DELETE /api/elements/:id
 * Supprime un élément
 */
export const deleteElement = async (req, res) => {
  try {
    const { id } = req.params;

    const { rowCount } = await query('DELETE FROM elements WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Élément supprimé'
    });
  } catch (error) {
    logger.error('Erreur suppression élément:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

/**
 * PUT /api/elements/:id/position
 * Met à jour la position d'un élément
 */
export const updateElementPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    if (typeof position !== 'number' || position < 0) {
      return res.status(400).json({
        success: false,
        error: 'Position invalide'
      });
    }

    const { rows } = await query(`
      UPDATE elements
      SET position = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [position, id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Élément non trouvé'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur mise à jour position élément:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};