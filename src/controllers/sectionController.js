/**
 * Section Controller
 * Gestion CRUD des sections modulaires (v2)
 */

import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Récupérer toutes les sections avec leur contenu et décorations
 */
export const getAllSections = async () => {
  try {
    // 1. Récupérer toutes les sections
    const { rows: sections } = await query(`
      SELECT 
        id, type, title, position, is_visible,
        bg_color, bg_image, bg_video, bg_youtube, is_transparent,
        layout, padding_top, padding_bottom,
        created_at, updated_at
      FROM sections
      WHERE is_visible = TRUE
      ORDER BY position ASC
    `);
    
    // 2. Pour chaque section, récupérer son contenu
    for (const section of sections) {
      // Récupérer section_content
      const { rows: content } = await query(`
        SELECT 
          id, title, subtitle, description,
          cta_label, cta_url,
          media_url, media_type, media_alt, media_size,
          text_color, text_align, bg_color,
          position
        FROM section_content
        WHERE section_id = $1
        ORDER BY position ASC
      `, [section.id]);
      
      section.content = content;
      
      // Récupérer cards_v2 si c'est une card_grid ou gallery
      if (section.type === 'card_grid' || section.type === 'gallery') {
        const { rows: cards } = await query(`
          SELECT 
            id, title, description,
            media_url, media_type, link_url,
            bg_color, text_color,
            event_date, position
          FROM cards_v2
          WHERE section_id = $1
          ORDER BY position ASC
        `, [section.id]);
        
        section.cards = cards;
      }
      
      // Récupérer décorations
      const { rows: decorations } = await query(`
        SELECT 
          d.id, d.name, d.display_name, d.type, d.svg_code,
          sd.color, sd.opacity, sd.scale, sd.position, sd.z_index
        FROM section_decorations sd
        JOIN decorations d ON d.id = sd.decoration_id
        WHERE sd.section_id = $1
        ORDER BY sd.z_index ASC
      `, [section.id]);
      
      section.decorations = decorations;
    }
    
    return sections;
  } catch (error) {
    logger.error('Erreur getAllSections:', error);
    throw error;
  }
};

/**
 * Récupérer une section par ID
 */
export const getSectionById = async (sectionId) => {
  try {
    const { rows } = await query(`
      SELECT 
        id, type, title, position, is_visible,
        bg_color, bg_image, bg_video, bg_youtube, is_transparent,
        layout, padding_top, padding_bottom,
        created_at, updated_at
      FROM sections
      WHERE id = $1
    `, [sectionId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const section = rows[0];
    
    // Récupérer contenu
    const { rows: content } = await query(`
      SELECT * FROM section_content
      WHERE section_id = $1
      ORDER BY position ASC
    `, [sectionId]);
    
    section.content = content;
    
    // Récupérer cards si applicable
    if (section.type === 'card_grid' || section.type === 'gallery') {
      const { rows: cards } = await query(`
        SELECT * FROM cards_v2
        WHERE section_id = $1
        ORDER BY position ASC
      `, [sectionId]);
      
      section.cards = cards;
    }
    
    // Récupérer décorations
    const { rows: decorations } = await query(`
      SELECT 
        d.id, d.name, d.display_name, d.type, d.svg_code,
        sd.color, sd.opacity, sd.scale, sd.position, sd.z_index
      FROM section_decorations sd
      JOIN decorations d ON d.id = sd.decoration_id
      WHERE sd.section_id = $1
    `, [sectionId]);
    
    section.decorations = decorations;
    
    return section;
  } catch (error) {
    logger.error('Erreur getSectionById:', error);
    throw error;
  }
};

/**
 * Créer une nouvelle section
 */
export const createSection = async (sectionData) => {
  try {
    const {
      type,
      title,
      position,
      bg_color,
      bg_image,
      bg_video,
      is_transparent = false,
      layout,
      padding_top = 'medium',
      padding_bottom = 'medium'
    } = sectionData;
    
    const { rows } = await query(`
      INSERT INTO sections (
        type, title, position,
        bg_color, bg_image, bg_video, is_transparent,
        layout, padding_top, padding_bottom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      type, title, position,
      bg_color, bg_image, bg_video, is_transparent,
      layout, padding_top, padding_bottom
    ]);
    
    logger.info(`Section créée: #${rows[0].id} (${type})`);
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
      bg_color,
      bg_image,
      bg_video,
      bg_youtube,
      is_transparent,
      layout,
      padding_top,
      padding_bottom,
      is_visible
    } = sectionData;
    
    // Construire dynamiquement la requête pour ne mettre à jour QUE les champs fournis
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
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
    if (layout !== undefined) {
      updates.push(`layout = $${paramIndex++}`);
      values.push(layout);
    }
    if (padding_top !== undefined) {
      updates.push(`padding_top = $${paramIndex++}`);
      values.push(padding_top);
    }
    if (padding_bottom !== undefined) {
      updates.push(`padding_bottom = $${paramIndex++}`);
      values.push(padding_bottom);
    }
    if (is_visible !== undefined) {
      updates.push(`is_visible = $${paramIndex++}`);
      values.push(is_visible);
    }
    
    if (updates.length === 0) {
      logger.info(`Section #${sectionId} - aucune mise à jour`);
      const { rows } = await query('SELECT * FROM sections WHERE id = $1', [sectionId]);
      return rows[0] || null;
    }
    
    values.push(sectionId);
    
    const { rows } = await query(`
      UPDATE sections SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (rows.length === 0) {
      logger.info(`Section mise à jour: #${sectionId} - non trouvée`);
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
 * Supprimer une section (cascade sur content et cards)
 */
export const deleteSection = async (sectionId) => {
  try {
    const result = await query('DELETE FROM sections WHERE id = $1', [sectionId]);
    const deleted = result.rowCount > 0;
    logger.info(`Section supprimée: #${sectionId}`);
    return deleted;
  } catch (error) {
    logger.error('Erreur deleteSection:', error);
    throw error;
  }
};

/**
 * Ajouter du contenu à une section
 */
export const addSectionContent = async (sectionId, contentData) => {
  try {
    const {
      title,
      subtitle,
      description,
      cta_label,
      cta_url,
      media_url,
      media_type,
      media_alt,
      media_size = 'medium',
      text_color,
      text_align = 'left',
      bg_color,
      position = 0
    } = contentData;
    
    const { rows } = await query(`
      INSERT INTO section_content (
        section_id, title, subtitle, description,
        cta_label, cta_url,
        media_url, media_type, media_alt, media_size,
        text_color, text_align, bg_color,
        position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      sectionId, title, subtitle, description,
      cta_label, cta_url,
      media_url, media_type, media_alt, media_size,
      text_color, text_align, bg_color,
      position
    ]);
    
    logger.info(`Contenu ajouté à section #${sectionId}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur addSectionContent:', error);
    throw error;
  }
};

/**
 * Ajouter une card à une section
 */
export const addSectionCard = async (sectionId, cardData) => {
  try {
    const {
      title,
      description,
      media_url,
      media_type,
      link_url,
      bg_color,
      text_color,
      event_date,
      position = 0
    } = cardData;
    
    const { rows } = await query(`
      INSERT INTO cards_v2 (
        section_id, title, description,
        media_url, media_type, link_url,
        bg_color, text_color,
        event_date, position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      sectionId, title, description,
      media_url, media_type, link_url,
      bg_color, text_color,
      event_date, position
    ]);
    
    logger.info(`Card ajoutée à section #${sectionId}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur addSectionCard:', error);
    throw error;
  }
};

/**
 * Ajouter une décoration à une section
 */
export const addSectionDecoration = async (sectionId, decorationData) => {
  try {
    const {
      decoration_id,
      color,
      opacity = 0.8,
      scale = 1.0,
      position = 'top-left',
      z_index = 1
    } = decorationData;
    
    await query(`
      INSERT INTO section_decorations (
        section_id, decoration_id,
        color, opacity, scale, position, z_index
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (section_id, decoration_id, position) 
      DO UPDATE SET
        color = EXCLUDED.color,
        opacity = EXCLUDED.opacity,
        scale = EXCLUDED.scale,
        z_index = EXCLUDED.z_index
    `, [
      sectionId, decoration_id,
      color, opacity, scale, position, z_index
    ]);
    
    logger.info(`Décoration #${decoration_id} ajoutée à section #${sectionId}`);
  } catch (error) {
    logger.error('Erreur addSectionDecoration:', error);
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
