
import { query } from './src/config/db.js';
const hero = await query('SELECT id FROM sections WHERE type = \
hero\');
console.log('Hero ID:', hero.rows[0]?.id);
const elements = await query('SELECT type, settings FROM elements WHERE section_id = \', [hero.rows[0]?.id]);
elements.rows.forEach((el, i) => {
  console.log(\Element \ (\):\, el.settings?.align, el.settings?.vertical_align);
});

