import { query } from '../src/config/db.js';

async function checkSections() {
  try {
    const result = await query('SELECT id, type, position, is_visible FROM sections ORDER BY position ASC');
    console.log('Sections dans la DB:', result.rows.length);
    result.rows.forEach(s => {
      console.log(`ID: ${s.id}, Type: ${s.type}, Position: ${s.position}, Visible: ${s.is_visible}`);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkSections();
