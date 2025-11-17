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

async function convertObsoleteBlocks() {
  try {
    // Convertir tous les types obsolètes (events, offers, photos, videos, etc.) en 'cards'
    const result = await pool.query(`
      UPDATE blocks 
      SET type = 'cards' 
      WHERE type NOT IN ('header', 'footer') 
      RETURNING id, type, title
    `);
    
    console.log(`\n✅ ${result.rowCount} bloc(s) converti(s) en type 'cards':`);
    result.rows.forEach(block => {
      console.log(`  - Bloc #${block.id}: ${block.title}`);
    });
    
    // Vérifier l'état final
    const blocksResult = await pool.query('SELECT id, type, title FROM blocks ORDER BY position');
    console.log('\n=== État final des blocs ===');
    blocksResult.rows.forEach(block => {
      console.log(`#${block.id} - ${block.type}: ${block.title || '(sans titre)'}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

convertObsoleteBlocks();
