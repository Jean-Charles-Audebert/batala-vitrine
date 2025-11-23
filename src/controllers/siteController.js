import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fonctions utilitaires pour les vues
 */
function getSectionStyles(section) {
  const styles = [];

  if (section.settings && section.settings.bg_color) {
    styles.push(`background-color: ${section.settings.bg_color}`);
  }

  if (section.settings && section.settings.bg_media_url) {
    styles.push(`background-image: url('${section.settings.bg_media_url}')`);
    styles.push(`background-size: cover`);
    styles.push(`background-position: center`);
  }

  if (section.layout && section.layout.padding_top) {
    styles.push(`padding-top: ${getPaddingValue(section.layout.padding_top)}`);
  }

  if (section.layout && section.layout.padding_bottom) {
    styles.push(`padding-bottom: ${getPaddingValue(section.layout.padding_bottom)}`);
  }

  return styles.join('; ');
}

function getElementStyles(element) {
  const styles = [];

  // Gestion de la grille 12 colonnes
  if (element.settings && element.settings.grid_columns) {
    styles.push(`grid-column: span ${element.settings.grid_columns}`);
  }

  return styles.join('; ');
}

function getPaddingValue(padding) {
  switch (padding) {
    case 'small': return '2rem';
    case 'medium': return '4rem';
    case 'large': return '6rem';
    case 'xl': return '8rem';
    default: return '4rem';
  }
}

/**
 * GET /
 * Page publique - affiche uniquement les sections visibles
 */
export const showPublicPage = async (req, res) => {
  try {
    logger.info('🏠 Chargement page publique...');

    // Récupérer les données depuis la BDD
    const pageData = await getPageData(true); // true = seulement sections visibles

    logger.info(`📄 Page publique avec ${pageData.sections.length} sections visibles`);

    // Rendre la vue publique
    return res.render('pages/public', {
      title: pageData.page.title || 'Mon Site',
      pageData,
      user: req.user || null
    });

  } catch (error) {
    logger.error('Erreur chargement page publique:', error);
    return res.status(500).render('error', {
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * GET /editor
 * Page d'édition - affiche toutes les sections (y compris invisibles)
 */
export const showEditorPage = async (req, res) => {
  try {
    logger.info('✏️ Chargement éditeur...');

    // Vérifier l'authentification
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    // Récupérer les données depuis la BDD
    const pageData = await getPageData(false); // false = toutes les sections

    // Charger les schémas des sections
    const schemasPath = path.join(__dirname, '../../config/schemas.json');
    const schemas = JSON.parse(fs.readFileSync(schemasPath, 'utf8'));
    pageData.schemas = schemas;

    logger.info(`📝 Éditeur avec ${pageData.sections.length} sections totales`);
    logger.info(`🔤 Fonts chargées: ${pageData.fonts ? pageData.fonts.length : 'undefined'}`);

    // Rendre la vue d'édition
    return res.render('pages/editor', {
      title: 'Éditeur - ' + (pageData.page.title || 'Mon Site'),
      pageData,
      user: req.user
    });

  } catch (error) {
    logger.error('Erreur chargement éditeur:', error);
    return res.status(500).render('error', {
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * Récupère et transforme les données de page depuis la BDD
 * @param {boolean} onlyVisible - Si true, ne retourne que les sections visibles
 * @returns {Object} Données conformes à la structure JSON demandée
 */
async function getPageData(onlyVisible = false) {
  try {
    // Récupérer la page globale (singleton)
    const { rows: pageRows } = await query(`
      SELECT
        title,
        title_font_id,
        text_font_id,
        contact_email,
        main_bg_color,
        main_bg_media_url,
        main_bg_youtube_url,
        main_bg_opacity,
        main_bg_position
      FROM page
      LIMIT 1
    `);

    const pageData = pageRows[0] || {
      title: 'Mon Site',
      title_font_id: null,
      text_font_id: null,
      contact_email: '',
      main_bg_color: '#ffffff',
      main_bg_media_url: null,
      main_bg_youtube_url: null,
      main_bg_opacity: 1.0,
      main_bg_position: 'center'
    };

    // Transformer en structure page demandée
    const page = {
      title: pageData.title,
      main_bg_color: pageData.main_bg_color,
      main_bg_media_url: pageData.main_bg_media_url,
      main_bg_youtube_url: pageData.main_bg_youtube_url,
      main_bg_opacity: parseFloat(pageData.main_bg_opacity),
      main_bg_position: pageData.main_bg_position,
      title_font_id: pageData.title_font_id,
      text_font_id: pageData.text_font_id,
      contact_email: pageData.contact_email
    };

    // Récupérer les sections
    const sectionsQuery = `
      SELECT
        id,
        title,
        position,
        is_visible,
        layout,
        settings
      FROM sections
      ${onlyVisible ? 'WHERE is_visible = true' : ''}
      ORDER BY position ASC
    `;

    logger.info('Requête sections:', sectionsQuery);

    const { rows: sectionsRows } = await query(sectionsQuery);

    // Pour chaque section, récupérer ses éléments
    const sections = await Promise.all(
      sectionsRows.map(async (sectionRow) => {
        const { rows: elementsRows } = await query(`
          SELECT
            id,
            type,
            title,
            position,
            settings
          FROM elements
          WHERE section_id = $1
          ORDER BY position ASC
        `, [sectionRow.id]);

        // Transformer les éléments
        const elements = elementsRows.map(elementRow => ({
          id: elementRow.id,
          type: elementRow.type,
          title: elementRow.title,
          position: elementRow.position,
          settings: elementRow.settings || {}
        }));

        // Extraire les valeurs du settings JSONB
        const sectionSettings = sectionRow.settings || {};

        // Transformer la section selon la structure attendue
        const transformedSection = {
          id: sectionRow.id,
          type: sectionRow.layout?.type || sectionSettings.type || 'content', // Type depuis layout
          title: sectionRow.title,
          show_title: sectionSettings.show_title !== false,
          is_visible: sectionRow.is_visible,
          position: sectionRow.position,
          layout: sectionRow.layout || {},
          settings: sectionSettings,
          elements: elements
        };

        return transformedSection;
      })
    );

    // Récupérer les fonts
    const { rows: fontsRows } = await query('SELECT id, name, source, font_family FROM fonts ORDER BY name');

    const fonts = fontsRows.map(fontRow => ({
      id: fontRow.id,
      name: fontRow.name,
      source: fontRow.source,
      font_family: fontRow.font_family
    }));

    return {
      page,
      sections,
      fonts
    };

  } catch (error) {
    logger.error('Erreur récupération données page:', error);
    throw error;
  }
}