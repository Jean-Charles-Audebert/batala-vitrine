import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { deleteFileAndOriginal } from '../utils/imageOptimizer.js';
import path from 'path';

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

    const pageData = rows[0];

    // Parser les settings si nécessaire
    if (typeof pageData.settings === 'string') {
      try {
        pageData.settings = JSON.parse(pageData.settings);
      } catch {
        pageData.settings = {};
      }
    }

    // Retourner les données directement avec les settings accessibles
    res.json({
      success: true,
      data: pageData
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
    const data = req.body;

    // Séparer les champs qui vont dans les colonnes normales vs settings JSONB
    const columnFields = ['title', 'default_font_title', 'default_font_text', 'contact_email'];
    const settingsFields = ['bg_color', 'bg_opacity', 'bg_position', 'bg_image', 'bg_video', 'bg_video_youtube', 'bg_transparent'];

    const columnData = {};
    const settingsData = {};

    // Distribuer les données dans les bonnes catégories
    Object.keys(data).forEach(key => {
      if (columnFields.includes(key)) {
        columnData[key] = data[key];
      } else if (settingsFields.includes(key)) {
        settingsData[key] = data[key];
      }
    });

    // Récupérer l'ancienne valeur de bg_image pour supprimer le fichier si nécessaire
    let oldBgMediaUrl = null;
    if (settingsData.bg_image !== undefined) {
      const { rows } = await query('SELECT settings FROM page ORDER BY id DESC LIMIT 1');
      if (rows.length > 0 && rows[0].settings) {
        oldBgMediaUrl = rows[0].settings.bg_image;
      }
    }

    // Construire la requête de mise à jour
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Champs colonnes normales
    Object.keys(columnData).forEach(key => {
      if (columnData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(columnData[key]);
        paramIndex++;
      }
    });

    // Si on a des données settings, mettre à jour le JSONB
    if (Object.keys(settingsData).length > 0) {
      // Récupérer les settings actuels
      const { rows: currentRows } = await query('SELECT settings FROM page ORDER BY id DESC LIMIT 1');
      const currentSettings = currentRows.length > 0 && currentRows[0].settings ? currentRows[0].settings : {};

      // Fusionner les settings
      const newSettings = { ...currentSettings, ...settingsData };

      updateFields.push(`settings = $${paramIndex}`);
      values.push(JSON.stringify(newSettings));
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée à mettre à jour'
      });
    }

    const { rows } = await query(`
      UPDATE page
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = (SELECT id FROM page ORDER BY id DESC LIMIT 1)
      RETURNING *
    `, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Page non trouvée'
      });
    }

    // Supprimer l'ancien fichier si bg_image a changé
    if (oldBgMediaUrl && oldBgMediaUrl !== settingsData.bg_image) {
      // Supprimer l'ancien fichier seulement s'il était dans /uploads/
      if (oldBgMediaUrl.startsWith('/uploads/')) {
        const fullPath = path.join(process.cwd(), 'public', oldBgMediaUrl);
        await deleteFileAndOriginal(fullPath);
      }
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    logger.error('Erreur mise à jour page:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};