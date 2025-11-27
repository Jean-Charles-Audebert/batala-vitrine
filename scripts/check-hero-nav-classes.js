import { query } from '../src/config/db.js';

async function checkHeroClasses() {
  try {
    const sectionsResult = await query('SELECT id, type, settings FROM sections WHERE type = \'hero\' LIMIT 1');
    const section = sectionsResult.rows[0];

    if (!section) {
      console.log('Aucune section hero trouvée');
      return;
    }

    // Simuler la logique du template
    const navElements = await query('SELECT settings FROM elements WHERE section_id = $1 AND type = \'link\' AND settings->>\'link_type\' = \'navigation\'', [section.id]);

    console.log('Section hero:', section.id);
    console.log('Éléments de navigation trouvés:', navElements.rows.length);

    if (navElements.rows.length > 0) {
      const navSettings = navElements.rows[0].settings || {};
      const nav_align = navSettings.align || 'center';
      const nav_vertical_align = navSettings.vertical_align || 'top';

      console.log('Premier élément nav settings:', JSON.stringify(navSettings, null, 2));
      console.log('nav_align:', nav_align);
      console.log('nav_vertical_align:', nav_vertical_align);

    const navClasses = ['hero-nav'];
    if (nav_align && nav_vertical_align) {
      const colMap = { 'left': 'col-1', 'center': 'col-6', 'right': 'col-12' };
      const rowMap = { 'top': 'row-1', 'center': 'row-2', 'bottom': 'row-3' };
      navClasses.push(colMap[nav_align] || 'col-6');
      navClasses.push(rowMap[nav_vertical_align] || 'row-2');
    }
    console.log('Classes CSS appliquées au nav:', navClasses.join(' '));

    // Vérifier la grille CSS
    const colMap = { 'left': 'col-1', 'center': 'col-6', 'right': 'col-12' };
    const rowMap = { 'top': 'row-1', 'center': 'row-2', 'bottom': 'row-3' };
    console.log('\nVérification de la grille CSS:');
    console.log('Container hero utilise display: grid avec 12 colonnes et 3 lignes');
    console.log(`Nav positionné en ${nav_align || 'center'} (${colMap[nav_align] || 'col-6'}) et ${nav_vertical_align || 'top'} (${rowMap[nav_vertical_align] || 'row-1'})`);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkHeroClasses();