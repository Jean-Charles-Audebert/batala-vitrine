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

async function checkPhotosVideos() {
  try {
    // Vérifier les blocs photos/videos
    const blocksResult = await pool.query(`
      SELECT id, type, title 
      FROM blocks 
      WHERE type IN ('photos', 'videos')
    `);
    
    console.log('\n=== Blocs photos/videos ===');
    console.log(`Nombre total: ${blocksResult.rows.length}`);
    blocksResult.rows.forEach(block => {
      console.log(`- Bloc #${block.id}: ${block.type} - "${block.title}"`);
    });
    
    // Vérifier les cartes associées
    if (blocksResult.rows.length > 0) {
      const blockIds = blocksResult.rows.map(b => b.id);
      const cardsResult = await pool.query(`
        SELECT id, block_id, template, title, media_path 
        FROM cards 
        WHERE block_id = ANY($1)
      `, [blockIds]);
      
      console.log('\n=== Cartes associées ===');
      console.log(`Nombre total: ${cardsResult.rows.length}`);
      cardsResult.rows.forEach(card => {
        console.log(`- Carte #${card.id} (bloc #${card.block_id}): template="${card.template}" - "${card.title}"`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkPhotosVideos();
