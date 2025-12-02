import { query } from '../src/config/db.js';

async function checkHero() {
  try {
    const { rows } = await query("SELECT id, type, settings FROM sections WHERE type='hero' LIMIT 1");
    console.log('Hero section:', JSON.stringify(rows[0], null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkHero();
