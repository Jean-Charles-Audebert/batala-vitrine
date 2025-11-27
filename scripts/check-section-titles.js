import { query } from '../src/config/db.js';

async function checkSectionTitles() {
  try {
    const result = await query('SELECT id, type, position, settings FROM sections WHERE type != \'hero\' AND type != \'footer\' ORDER BY position');
    console.log('Titres des sections:');
    result.rows.forEach((row, index) => {
      const settings = row.settings || {};
      console.log(`Section ${index + 1} (ID ${row.id}): type='${row.type}', position=${row.position}, title='${settings.title || 'N/A'}', show_title=${settings.show_title}`);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkSectionTitles();