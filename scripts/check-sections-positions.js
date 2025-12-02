import { query } from '../src/config/db.js';

async function checkSections() {
  try {
    const { rows } = await query("SELECT id, type, position FROM sections ORDER BY position ASC");
    console.log('Sections dans la BDD:');
    rows.forEach(r => console.log(`  ${r.id} | ${r.type.padEnd(10)} | position ${r.position}`));
    
    const { rows: heroRows } = await query("SELECT COUNT(*) as count FROM sections WHERE type='hero'");
    console.log(`\nNombre de sections hero: ${heroRows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkSections();
