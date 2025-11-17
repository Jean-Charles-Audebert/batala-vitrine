import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function checkCurrentBlocks() {
  try {
    const blocksResult = await pool.query('SELECT id, type, title FROM blocks ORDER BY position');
    
    console.log('\n=== Blocs existants ===');
    blocksResult.rows.forEach(block => {
      console.log(`#${block.id} - ${block.type}: ${block.title || '(sans titre)'}`);
    });
    
    // Vérifier si des cartes existent
    const cardsResult = await pool.query('SELECT COUNT(*) as count, template FROM cards GROUP BY template');
    console.log('\n=== Templates de cartes utilisés ===');
    if (cardsResult.rows.length === 0) {
      console.log('Aucune carte trouvée');
    } else {
      cardsResult.rows.forEach(row => {
        console.log(`- ${row.template}: ${row.count} carte(s)`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkCurrentBlocks();
