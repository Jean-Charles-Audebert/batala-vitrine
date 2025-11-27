import { query } from '../src/config/db.js';

async function updateNavElements() {
  try {
    console.log('=== MISE À JOUR DES ÉLÉMENTS DE NAVIGATION ===\n');

    // Trouver la section hero
    const heroSection = await query('SELECT id FROM sections WHERE type = \'hero\' LIMIT 1');
    if (heroSection.rows.length === 0) {
      console.log('Aucune section hero trouvée');
      return;
    }

    const sectionId = heroSection.rows[0].id;
    console.log(`Section hero trouvée: ID ${sectionId}`);

    // Récupérer tous les éléments de navigation de cette section
    const navElements = await query(
      'SELECT id, settings FROM elements WHERE section_id = $1 AND type = \'link\' AND settings->>\'link_type\' = \'navigation\' ORDER BY id',
      [sectionId]
    );

    console.log(`\n${navElements.rows.length} éléments de navigation trouvés`);

    // Mettre à jour chaque élément avec les propriétés d'alignement
    for (const element of navElements.rows) {
      const currentSettings = element.settings || {};
      const updatedSettings = {
        ...currentSettings,
        align: 'left',
        vertical_align: 'bottom'
      };

      await query(
        'UPDATE elements SET settings = $1 WHERE id = $2',
        [JSON.stringify(updatedSettings), element.id]
      );

      console.log(`✅ Élément ID ${element.id} mis à jour: align='left', vertical_align='bottom'`);
    }

    console.log('\n=== VÉRIFICATION ===');
    // Vérifier que la mise à jour a fonctionné
    const updatedElements = await query(
      'SELECT id, settings->>\'align\' as align, settings->>\'vertical_align\' as vertical_align FROM elements WHERE section_id = $1 AND type = \'link\' AND settings->>\'link_type\' = \'navigation\' ORDER BY id',
      [sectionId]
    );

    console.log('Éléments après mise à jour:');
    updatedElements.rows.forEach((row, index) => {
      console.log(`Element ${index + 1} (ID ${row.id}): align='${row.align}', vertical_align='${row.vertical_align}'`);
    });

    console.log('\n✅ Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

updateNavElements();