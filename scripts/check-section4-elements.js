import { query } from '../src/config/db.js';

async function checkSection4Elements() {
  const { rows } = await query(`
    SELECT e.id, e.type, e.col_start, e.col_end
    FROM sections s
    LEFT JOIN elements e ON s.id = e.section_id
    WHERE s.position = 4
    ORDER BY e.id
  `);

  console.log('Éléments de la section 4:');
  rows.forEach(row => {
    if (row.id) {
      console.log(`ID: ${row.id}, Type: ${row.type}, Col: ${row.col_start}-${row.col_end}`);
    }
  });
}

checkSection4Elements().catch(console.error);