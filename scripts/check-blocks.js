// Script pour vérifier les IDs des blocs
import { query } from '../src/config/db.js';

async function checkBlocks() {
  try {
    const { rows } = await query("SELECT id, type, title, slug FROM blocks ORDER BY position");
    console.log('Blocs existants:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkBlocks();
