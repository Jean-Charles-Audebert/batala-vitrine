import { query } from './src/config/db.js';

async function check() {
  const { rows } = await query('SELECT id, type, settings FROM sections WHERE type=$1', ['hero']);
  console.log('Hero sections:', JSON.stringify(rows, null, 2));
}

check().catch(console.error);
