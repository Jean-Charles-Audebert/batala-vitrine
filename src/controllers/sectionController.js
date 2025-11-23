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
        logo_url, logo_width, logo_position_h, logo_position_v,
        show_social_links, social_position_h, social_position_v, social_icon_size, social_icon_color,
        show_nav_links, nav_position_h, nav_position_v, nav_text_color, nav_bg_color,
        is_sticky,
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
          title_font_id, title_color, title_position_h, title_position_v,
          position
        FROM section_content
        WHERE section_id = $1
        ORDER BY position ASC
      `, [section.id]);
      
      section.content = content;
      
      // Si c'est un hero, récupérer les liens de navigation
      if (section.type === 'hero') {
        const { rows: navLinks } = await query(`
          SELECT hnl.id, hnl.target_section_id, hnl.label, hnl.position, hnl.is_visible,
                 s.title as target_title, s.type as target_type
          FROM hero_nav_links hnl
          LEFT JOIN sections s ON s.id = hnl.target_section_id
          WHERE hnl.section_id = $1 AND hnl.is_visible = TRUE
          ORDER BY hnl.position ASC
        `, [section.id]);
        
        section.nav_links = navLinks;
      }
      
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
        logo_url, logo_width, logo_position_h, logo_position_v,
        show_social_links, social_position_h, social_position_v, social_icon_size, social_icon_color,
        show_nav_links, nav_position_h, nav_position_v, nav_text_color, nav_bg_color,
        is_sticky,
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
    
    // Si c'est un hero, récupérer les liens de navigation
    if (section.type === 'hero') {
      const { rows: navLinks } = await query(`
        SELECT hnl.id, hnl.target_section_id, hnl.label, hnl.position, hnl.is_visible,
               s.title as target_title, s.type as target_type
        FROM hero_nav_links hnl
        LEFT JOIN sections s ON s.id = hnl.target_section_id
        WHERE hnl.section_id = $1
        ORDER BY hnl.position ASC
      `, [sectionId]);
      
      section.nav_links = navLinks;
    }
    
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
    
    // Définir le layout par défaut selon le type de section
    let defaultLayout;
    switch (type) {
      case 'card_grid':
        defaultLayout = 'grid_3';
        break;
      case 'content':
        defaultLayout = 'image_left';
        break;
      case 'gallery':
        defaultLayout = null; // Gallery n'utilise pas de layout
        break;
      default:
        defaultLayout = null;
    }
    
    const finalLayout = layout || defaultLayout;
    
    // Si position n'est pas fournie, calculer automatiquement
    let finalPosition = position;
    if (finalPosition === null || finalPosition === undefined) {
      // Trouver la position maximale actuelle (mais inférieure à 999)
      const { rows: maxPosRows } = await query(`
        SELECT COALESCE(MAX(position), 0) as max_pos 
        FROM sections 
        WHERE position < 999
      `);
      finalPosition = maxPosRows[0].max_pos + 1;
    }
    
    const { rows } = await query(`
      INSERT INTO sections (
        type, title, position,
        bg_color, bg_image, bg_video, is_transparent,
        layout, padding_top, padding_bottom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      type, title, finalPosition,
      bg_color, bg_image, bg_video, is_transparent,
      finalLayout, padding_top, padding_bottom
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
      bg_color,
      bg_image,
      bg_video,
      bg_youtube,
      is_transparent,
      layout,
      padding_top,
      padding_bottom,
      is_visible,
      content
    } = sectionData;
    
    // Mettre à jour la section principale
    const sectionUpdates = [];
    const sectionValues = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      sectionUpdates.push(`title = $${paramIndex++}`);
      sectionValues.push(title);
    }
    if (bg_color !== undefined) {
      sectionUpdates.push(`bg_color = $${paramIndex++}`);
      sectionValues.push(bg_color);
    }
    if (bg_image !== undefined) {
      sectionUpdates.push(`bg_image = $${paramIndex++}`);
      sectionValues.push(bg_image);
    }
    if (bg_video !== undefined) {
      sectionUpdates.push(`bg_video = $${paramIndex++}`);
      sectionValues.push(bg_video);
    }
    if (bg_youtube !== undefined) {
      sectionUpdates.push(`bg_youtube = $${paramIndex++}`);
      sectionValues.push(bg_youtube);
    }
    if (is_transparent !== undefined) {
      sectionUpdates.push(`is_transparent = $${paramIndex++}`);
      sectionValues.push(is_transparent);
    }
    if (layout !== undefined) {
      sectionUpdates.push(`layout = $${paramIndex++}`);
      sectionValues.push(layout);
    }
    if (padding_top !== undefined) {
      sectionUpdates.push(`padding_top = $${paramIndex++}`);
      sectionValues.push(padding_top);
    }
    if (padding_bottom !== undefined) {
      sectionUpdates.push(`padding_bottom = $${paramIndex++}`);
      sectionValues.push(padding_bottom);
    }
    if (is_visible !== undefined) {
      sectionUpdates.push(`is_visible = $${paramIndex++}`);
      sectionValues.push(is_visible);
    }
    
    let updatedSection = null;
    if (sectionUpdates.length > 0) {
      sectionValues.push(sectionId);
      
      const { rows } = await query(`
        UPDATE sections SET ${sectionUpdates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `, sectionValues);
      
      updatedSection = rows[0] || null;
    } else {
      // Récupérer la section actuelle si aucune mise à jour
      const { rows } = await query('SELECT * FROM sections WHERE id = $1', [sectionId]);
      updatedSection = rows[0] || null;
    }
    
    // Mettre à jour le contenu si fourni
    if (content && content.length > 0) {
      const contentData = content[0];
      
      // Vérifier si le contenu existe déjà
      const { rows: existingContent } = await query(
        'SELECT id FROM section_content WHERE section_id = $1 LIMIT 1',
        [sectionId]
      );
      
      if (existingContent.length > 0) {
        // Mettre à jour le contenu existant
        const contentId = existingContent[0].id;
        await updateSectionContent(contentId, contentData);
      } else {
        // Créer nouveau contenu
        await addSectionContent(sectionId, contentData);
      }
    }
    
    // TODO: Gérer la mise à jour des cartes si nécessaire
    
    logger.info(`Section mise à jour: #${sectionId}`);
    return updatedSection;
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
    console.log('🔧 addSectionContent appelé avec:');
    console.log('  sectionId:', sectionId);
    console.log('  contentData:', JSON.stringify(contentData, null, 2));

    const {
      title,
      description,
      media_url,
      media_type,
      media_size = 'large',
      media_position = 'left',
      text_color,
      text_align = 'left',
      title_font_id,
      title_color,
      bg_color,
      position = 0
    } = contentData;

    console.log('📋 Valeurs extraites:');
    console.log('  title:', title);
    console.log('  media_size:', media_size);
    console.log('  media_position:', media_position);
    console.log('  bg_color:', bg_color);

    const { rows } = await query(`
      INSERT INTO section_content (
        section_id, title, description,
        media_url, media_type, media_size,
        media_position,
        text_color, text_align,
        title_font_id, title_color,
        bg_color,
        position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      sectionId, title, description,
      media_url, media_type, media_size,
      media_position,
      text_color, text_align,
      title_font_id, title_color,
      bg_color,
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
 * Mettre à jour du contenu existant
 */
export async function updateSectionContent(contentId, updates) {
  try {
    // Vérifier que contentId est valide
    if (!contentId || isNaN(contentId)) {
      throw new Error('ID de contenu invalide');
    }

    // Construire la requête de mise à jour dynamique
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Parcourir les champs à mettre à jour
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error('Aucun champ à mettre à jour');
    }

    // Ajouter updated_at
    fields.push(`updated_at = NOW()`);

    // Construire la requête
    const queryText = `
      UPDATE section_content
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(contentId);

    const { rows } = await query(queryText, values);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error('Erreur dans updateSectionContent:', error);
    throw error;
  }
}

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
 * Mettre à jour une card existante
 */
export const updateSectionCard = async (cardId, cardData) => {
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
      position
    } = cardData;
    
    // Construire dynamiquement la requête pour ne mettre à jour QUE les champs fournis
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (media_url !== undefined) {
      updates.push(`media_url = $${paramIndex++}`);
      values.push(media_url);
    }
    if (media_type !== undefined) {
      updates.push(`media_type = $${paramIndex++}`);
      values.push(media_type);
    }
    if (link_url !== undefined) {
      updates.push(`link_url = $${paramIndex++}`);
      values.push(link_url);
    }
    if (bg_color !== undefined) {
      updates.push(`bg_color = $${paramIndex++}`);
      values.push(bg_color);
    }
    if (text_color !== undefined) {
      updates.push(`text_color = $${paramIndex++}`);
      values.push(text_color);
    }
    if (event_date !== undefined) {
      updates.push(`event_date = $${paramIndex++}`);
      values.push(event_date);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position);
    }
    
    if (updates.length === 0) {
      logger.info(`Card #${cardId} - aucune mise à jour`);
      const { rows } = await query('SELECT * FROM cards_v2 WHERE id = $1', [cardId]);
      return rows[0] || null;
    }
    
    // Ajouter updated_at
    updates.push(`updated_at = NOW()`);
    
    values.push(cardId);
    
    const { rows } = await query(`
      UPDATE cards_v2 SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);
    
    if (rows.length === 0) {
      logger.info(`Card mise à jour: #${cardId} - non trouvée`);
      return null;
    }
    
    logger.info(`Card mise à jour: #${cardId}`);
    return rows[0];
  } catch (error) {
    logger.error('Erreur updateSectionCard:', error);
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
