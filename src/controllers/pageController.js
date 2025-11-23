import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers de configuration
const SITE_CONFIG_PATH = path.join(__dirname, '../../config/site.json');
const SCHEMAS_PATH = path.join(__dirname, '../../config/schemas.json');

/**
 * Migre les données de la BDD vers le format JSON
 */
export async function migrateDBToJSON() {
  try {
    logger.info('🔄 Migration des données BDD vers JSON...');

    // Récupérer les paramètres de la page
    const { rows: pageRows } = await query(`
      SELECT p.*, f.name AS font_name, f.font_family, f.url AS font_url, f.file_path AS font_file
      FROM page p
      LEFT JOIN fonts f ON p.title_font_id = f.id
      WHERE p.id=1
    `);
    const pageSettings = pageRows[0];

    // Récupérer toutes les sections avec leur contenu
    const { rows: sections } = await query(`
      SELECT
        id, type, title, position, is_visible,
        bg_color, bg_image, bg_video, bg_youtube, is_transparent,
        layout, padding_top, padding_bottom,
        logo_url, logo_width, logo_position_h, logo_position_v,
        show_social_links, social_position_h, social_position_v, social_icon_size, social_icon_color,
        show_nav_links, nav_position_h, nav_position_v, nav_text_color, nav_bg_color,
        is_sticky
      FROM sections
      WHERE is_visible = TRUE
      ORDER BY position ASC
    `);

    // Transformer les sections au format JSON
    const jsonSections = [];
    for (const section of sections) {
      // Mapper les types de sections BDD vers les types JSON
      let jsonType = section.type;
      if (section.type === 'content') {
        jsonType = 'textMedia';
      } else if (section.type === 'card_grid') {
        jsonType = 'cards';
      } else if (section.type === 'footer') {
        // Ignorer les sections footer pour l'instant
        continue;
      }

      const jsonSection = {
        type: jsonType,
        id: `section-${section.id}`,
        position: section.position,
        visible: section.is_visible,
        data: {}
      };

      // Récupérer le contenu spécifique selon le type mappé
      if (jsonType === 'hero') {
        const { rows: content } = await query(`
          SELECT title, subtitle, description, cta_label, cta_url,
                 title_color, title_position_h, title_position_v
          FROM section_content WHERE section_id = $1 LIMIT 1
        `, [section.id]);

        if (content[0]) {
          jsonSection.data = {
            title: content[0].title || 'Bienvenue chez nous',
            subtitle: content[0].subtitle || 'On est sympas',
            description: content[0].description || 'Lorem ipsum dolor sit amet',
            cta_label: content[0].cta_label || 'Nous contacter',
            cta_url: content[0].cta_url || '#contact',
            title_color: content[0].title_color || '#ffffff',
            title_position_h: content[0].title_position_h || 'center',
            title_position_v: content[0].title_position_v || 'center',
            logo_url: section.logo_url,
            logo_width: section.logo_width || 150,
            logo_position_h: section.logo_position_h || 'center',
            logo_position_v: section.logo_position_v || 'center',
            show_social_links: section.show_social_links || false,
            social_position_h: section.social_position_h || 'right',
            social_position_v: section.social_position_v || 'top',
            social_icon_size: section.social_icon_size || 24,
            social_icon_color: section.social_icon_color || '#ffffff',
            show_nav_links: section.show_nav_links || false,
            nav_position_h: section.nav_position_h || 'right',
            nav_position_v: section.nav_position_v || 'center',
            nav_text_color: section.nav_text_color || '#ffffff',
            nav_bg_color: section.nav_bg_color || 'rgba(255,255,255,0.25)',
            is_sticky: section.is_sticky || false,
            bg_color: section.bg_color || '#1a1a1a',
            bg_image: section.bg_image,
            bg_video: section.bg_video,
            bg_youtube: section.bg_youtube,
            is_transparent: section.is_transparent || false,
            padding_top: section.padding_top || 'large',
            padding_bottom: section.padding_bottom || 'large'
          };
        }
      } else if (jsonType === 'textMedia') {
        const { rows: content } = await query(`
          SELECT title, description, media_url, media_type, media_position, media_size,
                 title_color, text_color, text_align, text_font_size_px as text_font_size
          FROM section_content WHERE section_id = $1 LIMIT 1
        `, [section.id]);

        if (content[0]) {
          jsonSection.data = {
            title: content[0].title || 'À propos de nous',
            description: content[0].description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            media_url: content[0].media_url,
            media_type: content[0].media_type || 'image',
            media_position: content[0].media_position || 'right',
            media_size: content[0].media_size || 'medium',
            media_width_percent: 50,
            title_color: content[0].title_color || '#333333',
            text_color: content[0].text_color || '#666666',
            bg_color: section.bg_color || '#ffffff',
            text_align: content[0].text_align || 'left',
            is_transparent: section.is_transparent || false,
            padding_top: section.padding_top || 'medium',
            padding_bottom: section.padding_bottom || 'medium'
          };
        }
      } else if (jsonType === 'cards') {
        const { rows: cards } = await query(`
          SELECT title, description, media_url, link_url
          FROM cards_v2 WHERE section_id = $1 ORDER BY position ASC
        `, [section.id]);

        jsonSection.data = {
          title: section.title || 'Nos prestations',
          title_color: '#333333',
          layout: section.layout || 'grid_3',
          bg_color: section.bg_color || '#f8f9fa',
          is_transparent: section.is_transparent || false,
          padding_top: section.padding_top || 'medium',
          padding_bottom: section.padding_bottom || 'medium',
          cards: cards.map((card, index) => ({
            id: `card-${index + 1}`,
            title: card.title || 'Activité',
            description: card.description || 'Description de l\'activité.',
            media_url: card.media_url,
            link_url: card.link_url || '#contact'
          }))
        };
      }

      jsonSections.push(jsonSection);
    }

    // Créer la configuration JSON
    const jsonConfig = {
      title: pageSettings.title || 'Site Vitrine',
      description: pageSettings.description || 'Description du site',
      global: {
        title_font_id: pageSettings.title_font_id,
        main_bg_color: pageSettings.main_bg_color || '#f5f5f5',
        main_bg_image: pageSettings.main_bg_image,
        main_bg_image_repeat: pageSettings.main_bg_image_repeat || 'no-repeat',
        main_bg_image_size: pageSettings.main_bg_image_size || 'cover',
        main_bg_video: pageSettings.main_bg_video,
        main_bg_youtube: pageSettings.main_bg_youtube
      },
      sections: jsonSections
    };

    // Sauvegarder dans le fichier JSON
    fs.writeFileSync(SITE_CONFIG_PATH, JSON.stringify(jsonConfig, null, 2), 'utf8');
    logger.info('✅ Migration terminée - données BDD converties en JSON');

    return jsonConfig;
  } catch (error) {
    logger.error('❌ Erreur lors de la migration BDD vers JSON:', error);
    throw error;
  }
}

/**
 * Sauvegarde la configuration du site
 */
function saveSiteConfig(config) {
  try {
    fs.writeFileSync(SITE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde config site:', error);
    return false;
  }
}

/**
 * Charge les schémas des sections
 */
function loadSchemas() {
  try {
    const data = fs.readFileSync(SCHEMAS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur chargement schémas:', error);
    return {};
  }
}

/**
 * Charge la configuration du site depuis le fichier JSON
 */
function loadSiteConfig() {
  try {
    const data = fs.readFileSync(SITE_CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur chargement config site:', error);
    return {
      title: "Site Vitrine",
      global: {},
      sections: []
    };
  }
}

/**
 * GET /page - Affiche la page en mode rendu (sans éditeur)
 */
export const showPage = async (req, res) => {
  try {
    // Charger la configuration depuis la base de données (même logique que l'éditeur)
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

    // Pour chaque section, récupérer son contenu
    for (const section of sections) {
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

      // Récupérer cards_v2 si applicable
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
    }

    // Charger la configuration globale
    const { rows: pageRows } = await query(`
      SELECT p.*, f.name AS font_name, f.font_family, f.url AS font_url, f.file_path AS font_file
      FROM page p
      LEFT JOIN fonts f ON p.title_font_id = f.id
      WHERE p.id=1
    `);
    const globalConfig = pageRows[0] || {};

    // Créer la config au format attendu par les templates
    const config = {
      title: globalConfig.title || 'Site Vitrine',
      description: globalConfig.description || 'Description du site',
      global: {
        title_font_id: globalConfig.title_font_id,
        main_bg_color: globalConfig.main_bg_color,
        main_bg_image: globalConfig.main_bg_image,
        main_bg_video: globalConfig.main_bg_video,
        main_bg_image_repeat: globalConfig.main_bg_image_repeat || 'no-repeat',
        main_bg_image_size: globalConfig.main_bg_image_size || 'cover'
      },
      sections: sections
    };

    // Charger les polices disponibles pour les variables CSS
    const fonts = [];
    try {
      const fontsData = fs.readFileSync(path.join(__dirname, '../../config/fonts.json'), 'utf8');
      fonts.push(...JSON.parse(fontsData));
    } catch {
      // Pas de fichier fonts.json, continuer sans
    }

    // Charger les liens sociaux
    const socialLinks = [];
    try {
      const socialData = fs.readFileSync(path.join(__dirname, '../../config/social-links.json'), 'utf8');
      socialLinks.push(...JSON.parse(socialData));
    } catch {
      // Pas de fichier social-links.json, continuer sans
    }

    res.render('pages/page', {
      title: config.title,
      description: config.description,
      config,
      fonts,
      socialLinks,
      user: req.user || null,
      mode: 'view' // Mode rendu
    });

  } catch (error) {
    console.error('Erreur affichage page:', error);
    res.status(500).send('Erreur serveur');
  }
};

/**
 * GET /editor - Affiche la page en mode édition (avec panneau latéral)
 */
export const showEditor = async (req, res) => {
  try {
    // Charger la configuration depuis la base de données
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

    // Pour chaque section, récupérer son contenu
    for (const section of sections) {
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
      
      // Récupérer cards_v2 si applicable
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
    }

    // Charger la configuration globale
    const { rows: pageRows } = await query(`
      SELECT p.*, f.name AS font_name, f.font_family, f.url AS font_url, f.file_path AS font_file
      FROM page p
      LEFT JOIN fonts f ON p.title_font_id = f.id
      WHERE p.id=1
    `);
    const globalConfig = pageRows[0] || {};

    // Créer la config au format attendu par les templates
    const config = {
      title: 'Site Vitrine',
      description: 'Description du site',
      global: {
        title_font_id: globalConfig.title_font_id,
        main_bg_color: globalConfig.main_bg_color,
        main_bg_image: globalConfig.main_bg_image,
        main_bg_video: globalConfig.main_bg_video,
        main_bg_image_repeat: globalConfig.main_bg_image_repeat || 'no-repeat',
        main_bg_image_size: globalConfig.main_bg_image_size || 'cover'
      },
      sections: sections
    };

    const schemas = loadSchemas();

    // Charger les polices disponibles pour les variables CSS
    const fonts = [];
    try {
      const fontsData = fs.readFileSync(path.join(__dirname, '../../config/fonts.json'), 'utf8');
      fonts.push(...JSON.parse(fontsData));
    } catch {
      // Pas de fichier fonts.json, continuer sans
    }

    // Charger les liens sociaux
    const socialLinks = [];
    try {
      const socialData = fs.readFileSync(path.join(__dirname, '../../config/social-links.json'), 'utf8');
      socialLinks.push(...JSON.parse(socialData));
    } catch {
      // Pas de fichier social-links.json, continuer sans
    }

    res.render('pages/editor', {
      title: `${config.title} - Éditeur`,
      config,
      schemas,
      fonts,
      socialLinks,
      user: req.user || null,
      mode: 'edit' // Mode édition
    });

  } catch (error) {
    console.error('Erreur affichage éditeur:', error);
    res.status(500).send('Erreur serveur');
  }
};

/**
 * POST /save-config - Sauvegarde la configuration du site
 */
export const saveConfig = async (req, res) => {
  try {
    const newConfig = req.body;

    // Validation basique
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ error: 'Configuration invalide' });
    }

    // Sauvegarder
    const success = saveSiteConfig(newConfig);

    if (success) {
      res.json({ success: true, message: 'Configuration sauvegardée' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
    }

  } catch (error) {
    console.error('Erreur sauvegarde config:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * GET /api/config - Récupère la configuration actuelle (pour l'éditeur)
 */
export const getConfig = async (req, res) => {
  try {
    const config = loadSiteConfig();
    res.json(config);
  } catch (error) {
    console.error('Erreur récupération config:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * GET /api/schemas - Récupère les schémas des sections
 */
export const getSchemas = async (req, res) => {
  try {
    const schemas = loadSchemas();
    res.json(schemas);
  } catch (error) {
    console.error('Erreur récupération schémas:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};