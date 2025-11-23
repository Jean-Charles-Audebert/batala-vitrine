/**
 * Page Builder Service
 * Construit les données JSON complètes de la page depuis la base de données
 */

import { query } from '../config/db.js';

/**
 * Construit les données complètes de la page pour l'affichage public
 * @returns {Promise<Object>} Données de la page avec sections visibles et leurs éléments
 */
export async function buildPageData() {
  try {
    // Charger les données de base de la page
    const pageData = await loadPageData();

    // Charger toutes les sections visibles avec leurs éléments
    const sections = await loadSectionsWithElements(true); // visible only

    // Charger les fonts utilisées
    const fonts = await loadFonts();

    return {
      page: pageData,
      sections: sections,
      fonts: fonts
    };
  } catch (error) {
    console.error('Erreur lors de la construction des données de page:', error);
    throw error;
  }
}

/**
 * Construit les données complètes de la page pour l'éditeur (toutes les sections)
 * @returns {Promise<Object>} Données de la page avec toutes les sections et leurs éléments
 */
export async function buildEditorData() {
  try {
    // Charger les données de base de la page
    const pageData = await loadPageData();

    // Charger toutes les sections (visibles et invisibles) avec leurs éléments
    const sections = await loadSectionsWithElements(false); // all sections

    // Charger les fonts utilisées
    const fonts = await loadFonts();

    return {
      page: pageData,
      sections: sections,
      fonts: fonts
    };
  } catch (error) {
    console.error('Erreur lors de la construction des données éditeur:', error);
    throw error;
  }
}

/**
 * Charge les données de la table page
 */
async function loadPageData() {
  const { rows } = await query('SELECT * FROM page LIMIT 1');
  return rows[0] || {};
}

/**
 * Charge toutes les sections avec leurs éléments
 * @param {boolean} visibleOnly - Si true, ne charge que les sections visibles
 */
async function loadSectionsWithElements(visibleOnly = true) {
  // Charger les sections de base
  let queryText = 'SELECT * FROM sections';
  const values = [];

  if (visibleOnly) {
    queryText += ' WHERE is_visible = true';
  }

  queryText += ' ORDER BY position ASC NULLS LAST, id ASC';

  const { rows: sections } = await query(queryText, values);

  // Pour chaque section, charger les éléments
  const sectionsWithElements = await Promise.all(
    sections.map(async (section) => {
      const elements = await loadSectionElements(section.id);

      return {
        ...section,
        elements
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
    SELECT * FROM elements
    WHERE section_id = $1
    ORDER BY position ASC, id ASC
  `, [sectionId]);

  return rows;
}

/**
 * Charge toutes les fonts utilisées
 */
async function loadFonts() {
  const { rows } = await query('SELECT * FROM fonts ORDER BY name');
  return rows;
}