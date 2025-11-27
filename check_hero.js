
import { query } from './src/config/db.js';
(async () => {
  const hero = await query('SELECT id FROM sections WHERE type = \
hero\');
  if (hero.rows.length > 0) {
    const elements = await query('SELECT type, settings FROM elements WHERE section_id = \', [hero.rows[0].id]);
    console.log('Hero elements:');
    elements.rows.forEach((el, i) => {
      console.log(\\. \:\, JSON.stringify(el.settings, null, 2));
    });
  }
})();

