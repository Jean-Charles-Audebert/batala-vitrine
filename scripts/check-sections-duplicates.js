import { query } from '../src/config/db.js';

async function checkSections() {
  try {
    // Vérifier les pages
    const pagesResult = await query('SELECT id, title, settings FROM page ORDER BY id');
    console.log('Pages dans la base:');
    pagesResult.rows.forEach(p => {
      console.log(`ID: ${p.id}, Title: ${p.title}, Settings: ${JSON.stringify(p.settings)}`);
    });

    // Vérifier les sections
    const result = await query('SELECT id, type, page_id, position, is_visible, created_at FROM sections ORDER BY id');
    console.log('\nSections dans la base:');
    result.rows.forEach(s => {
      console.log(`ID: ${s.id}, Type: ${s.type}, Page: ${s.page_id}, Position: ${s.position}, Visible: ${s.is_visible}, Created: ${s.created_at}`);
    });

    // Grouper par type et position pour identifier les doublons
    const sectionsByType = {};
    result.rows.forEach(s => {
      const key = `${s.type}-${s.position}`;
      if (!sectionsByType[key]) {
        sectionsByType[key] = [];
      }
      sectionsByType[key].push(s);
    });

    console.log('\nDoublons potentiels:');
    Object.keys(sectionsByType).forEach(key => {
      const sections = sectionsByType[key];
      if (sections.length > 1) {
        console.log(`Type-Position ${key}: ${sections.length} sections`);
        sections.forEach(s => console.log(`  - ID ${s.id} (page: ${s.page_id}, created: ${s.created_at})`));
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkSections();