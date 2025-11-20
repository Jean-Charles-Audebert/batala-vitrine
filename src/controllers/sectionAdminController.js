/**
 * Section Admin Controller
 * Gestion des pages admin pour sections v2
 */

import { getAllSections } from './sectionController.js';
import { logger } from '../utils/logger.js';

/**
 * Afficher la liste des sections (page admin)
 */
export const listSections = async (req, res) => {
  try {
    // Récupérer TOUTES les sections (même masquées) pour l'admin
    const { query } = await import('../config/db.js');
    const { rows } = await query(`
      SELECT 
        id, type, title, position, is_visible,
        bg_color, bg_image, bg_video, is_transparent,
        layout, padding_top, padding_bottom,
        created_at, updated_at
      FROM sections
      ORDER BY position ASC NULLS LAST, id ASC
    `);
    
    res.render('pages/sections', { 
      title: 'Gestion des sections', 
      sections: rows,
      success: req.query.success || null,
      user: req.user,
      scripts: ['/js/sections-admin.js'],
      currentPage: 'sections'
    });
  } catch (error) {
    logger.error('Erreur récupération sections admin', error);
    res.status(500).send('Erreur lors de la récupération des sections');
  }
};
