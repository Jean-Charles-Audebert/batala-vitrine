/**
 * Page Builder Service
 * Construit les données JSON complètes de la page depuis la base de données PostgreSQL uniquement
 */

import { query } from '../config/db.js';

/**
 * Construit les données complètes de la page pour l'affichage public
 * @returns {Promise<Object>} Données de la page avec sections visibles et leurs éléments
 */
export async function buildPageData() {
  const pageData = await loadPageData();
  const sections = await loadSectionsWithElements(true); // visible only

  return {
    page: pageData,
    sections: sections
  };
}

/**
 * Construit les données complètes de la page pour l'éditeur (toutes les sections)
 * @returns {Promise<Object>} Données de la page avec toutes les sections et leurs éléments
 */
export async function buildEditorData() {
  const pageData = await loadPageData();
  const sections = await loadSectionsWithElements(false); // all sections

  return {
    page: pageData,
    sections: sections
  };
}

/**
 * Charge les données de la table page
 */
async function loadPageData() {
  const { rows } = await query('SELECT * FROM page LIMIT 1');
  const page = rows[0] || {};

  // Retourner exactement les champs attendus par le frontend
  return {
    title: page.title || 'Mon Site',
    default_font_title: page.default_font_title || null,
    default_font_text: page.default_font_text || null,
    contact_email: page.contact_email || null,
    settings: page.settings || {}
  };
}

/**
 * Charge toutes les sections avec leurs éléments
 * @param {boolean} visibleOnly - Si true, ne charge que les sections visibles
 */
async function loadSectionsWithElements(visibleOnly = true) {
  // Charger les sections de base
  let queryText = `
    SELECT
      id, type, position, is_visible, settings
    FROM sections
  `;
  const values = [];

  if (visibleOnly) {
    queryText += ' WHERE is_visible = true';
  }

  queryText += ' ORDER BY position ASC NULLS LAST, id ASC';

  const { rows: sections } = await query(queryText, values);

  // Pour chaque section, charger ses éléments
  const sectionsWithElements = await Promise.all(
    sections.map(async (section) => {
      const elements = await loadSectionElements(section.id);

      // Retourner exactement la structure attendue par le frontend
      return {
        id: section.id,
        type: section.type,
        position: section.position,
        is_visible: section.is_visible,
        settings: section.settings || {},
        elements: elements
      };
    })
  );

  return sectionsWithElements;
}

/**
 * Charge les éléments d'une section
 */
async function loadSectionElements(sectionId) {
  const { rows } = await query(`
    SELECT
      id, type, col_start, col_end, settings
    FROM elements
    WHERE section_id = $1
    ORDER BY col_start ASC, id ASC
  `, [sectionId]);

  // Retourner exactement la structure attendue par le frontend
  return rows.map(element => ({
    id: element.id,
    type: element.type,
    col_start: element.col_start,
    col_end: element.col_end,
    settings: element.settings || {}
  }));
}