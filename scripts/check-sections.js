/**
 * Script de vérification: Affiche les sections migrées
 */

import { query } from '../src/config/db.js';
import 'dotenv/config';

console.log('🔍 Vérification des sections\n');

async function checkSections() {
  try {
    // 1. SECTIONS
    console.log('📦 SECTIONS:\n');
    const sectionsResult = await query(`
      SELECT 
        id,
        type,
        title,
        layout,
        position,
        bg_color,
        is_transparent
      FROM sections
      ORDER BY position ASC
    `);
    
    if (sectionsResult.rows.length === 0) {
      console.log('   ⚠️  Aucune section trouvée\n');
    } else {
      sectionsResult.rows.forEach(section => {
        console.log(`   #${section.id} - ${section.type.toUpperCase()} "${section.title || '(sans titre)'}"`);
        console.log(`      Layout: ${section.layout || 'N/A'}, Position: ${section.position}`);
        console.log(`      Fond: ${section.bg_color || 'transparent'}, Transparent: ${section.is_transparent}`);
        console.log('');
      });
    }
    
    // 2. ELEMENTS (remplace section_content et cards_v2)
    console.log('\n🔧 ELEMENTS:\n');
    const elementsResult = await query(`
      SELECT
        e.id,
        e.section_id,
        s.type as section_type,
        e.type as element_type,
        e.title,
        e.position,
        e.settings
      FROM elements e
      JOIN sections s ON s.id = e.section_id
      ORDER BY e.section_id, e.position ASC
    `);

    if (elementsResult.rows.length === 0) {
      console.log('   ⚠️  Aucun élément trouvé\n');
    } else {
      // Grouper par section
      const elementsBySection = {};
      elementsResult.rows.forEach(element => {
        if (!elementsBySection[element.section_id]) {
          elementsBySection[element.section_id] = {
            section_type: element.section_type,
            elements: []
          };
        }
        elementsBySection[element.section_id].elements.push(element);
      });

      Object.keys(elementsBySection).forEach(sectionId => {
        const section = elementsBySection[sectionId];
        console.log(`   Section #${sectionId} (${section.section_type}):`);
        section.elements.forEach(element => {
          console.log(`      #${element.id} - ${element.element_type}: "${element.title || '(sans titre)'}" (pos: ${element.position})`);
          // Afficher quelques settings clés
          const settings = element.settings || {};
          if (settings.content) console.log(`         Contenu: "${settings.content.substring(0, 50)}${settings.content.length > 50 ? '...' : ''}"`);
          if (settings.url) console.log(`         URL: ${settings.url}`);
          if (settings.title) console.log(`         Titre: "${settings.title}"`);
        });
        console.log('');
      });
    }
    
    // 4. DÉCORATIONS
    console.log('\n✨ DÉCORATIONS DISPONIBLES:\n');
    const decorationsResult = await query(`
      SELECT 
        id,
        display_name,
        type,
        default_color,
        is_active
      FROM decorations
      WHERE is_active = TRUE
      ORDER BY id ASC
    `);
    
    if (decorationsResult.rows.length === 0) {
      console.log('   ⚠️  Aucune décoration trouvée (exécutez db/004_seed_decorations.sql)\n');
    } else {
      decorationsResult.rows.forEach(deco => {
        console.log(`   #${deco.id} - ${deco.display_name} (${deco.type}) - ${deco.default_color}`);
      });
      console.log('');
    }
    
    // 3. STATISTIQUES
    console.log('\n📊 STATISTIQUES:\n');
    console.log(`   Sections:        ${sectionsResult.rows.length}`);
    console.log(`   elements:        ${elementsResult.rows.length}`);
    console.log(`   Décorations:     ${decorationsResult.rows.length}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkSections();
