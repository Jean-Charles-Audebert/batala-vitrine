/**
 * Social Links Controller
 * Gestion des liens de réseaux sociaux
 */

import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Récupérer tous les liens sociaux
 */
export const getAllSocialLinks = async () => {
  try {
    const { rows } = await query(`
      SELECT id, platform, url, label, icon_svg, position, is_visible, location
      FROM social_links
      WHERE is_visible = TRUE
      ORDER BY position ASC
    `);
    return rows;
  } catch (error) {
    logger.error('Erreur récupération social links', error);
    return [];
  }
};

/**
 * Créer un nouveau lien social
 */
export const createSocialLink = async (data) => {
  const { platform, url, label, location = 'footer', position } = data;
  
  try {
    const { rows } = await query(`
      INSERT INTO social_links (platform, url, label, location, position)
      VALUES ($1, $2, $3, $4, COALESCE($5, (SELECT COALESCE(MAX(position), 0) + 1 FROM social_links)))
      RETURNING *
    `, [platform, url, label, location, position]);
    
    logger.info(`Social link créé: ${platform}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur création social link', error);
    throw error;
  }
};

/**
 * Mettre à jour un lien social
 */
export const updateSocialLink = async (id, data) => {
  const { platform, url, label, location, position, is_visible } = data;
  
  try {
    await query(`
      UPDATE social_links 
      SET platform = $1, url = $2, label = $3, location = $4, 
          position = $5, is_visible = $6, updated_at = NOW()
      WHERE id = $7
    `, [platform, url, label, location, position, is_visible, id]);
    
    logger.info(`Social link ${id} mis à jour`);
  } catch (error) {
    logger.error('Erreur mise à jour social link', error);
    throw error;
  }
};

/**
 * Supprimer un lien social
 */
export const deleteSocialLink = async (id) => {
  try {
    await query('DELETE FROM social_links WHERE id = $1', [id]);
    logger.info(`Social link ${id} supprimé`);
    return true;
  } catch (error) {
    logger.error('Erreur suppression social link', error);
    return false;
  }
};
