import { query } from '../src/config/db.js';

const result = await query('SELECT id, block_id, template, title FROM cards ORDER BY id DESC LIMIT 10');

console.log('\nDernières cartes créées:');
result.rows.forEach(card => {
  console.log(`  #${card.id} (bloc ${card.block_id}): template="${card.template}" - ${card.title || '(sans titre)'}`);
});

process.exit(0);
