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
    
    // 2. SECTION_CONTENT
    console.log('\n📝 SECTION_CONTENT:\n');
    const contentResult = await query(`
      SELECT 
        sc.id,
        sc.section_id,
        s.type as section_type,
        sc.title,
        sc.media_url,
        sc.media_size,
        sc.position
      FROM section_content sc
      JOIN sections s ON s.id = sc.section_id
      ORDER BY sc.section_id, sc.position ASC
    `);
    
    if (contentResult.rows.length === 0) {
      console.log('   ⚠️  Aucun contenu trouvé\n');
    } else {
      contentResult.rows.forEach(content => {
        console.log(`   #${content.id} → Section #${content.section_id} (${content.section_type})`);
        console.log(`      Titre: "${content.title || '(sans titre)'}"`);
        console.log(`      Media: ${content.media_url ? `${content.media_url} (${content.media_size})` : 'Aucun'}`);
        console.log('');
      });
    }
    
    // 3. CARDS_V2
    console.log('\n🎴 CARDS_V2:\n');
    const cardsResult = await query(`
      SELECT 
        c.id,
        c.section_id,
        s.type as section_type,
        c.title,
        c.media_url,
        c.event_date,
        c.position
      FROM cards_v2 c
      JOIN sections s ON s.id = c.section_id
      ORDER BY c.section_id, c.position ASC
    `);
    
    if (cardsResult.rows.length === 0) {
      console.log('   ⚠️  Aucune card trouvée\n');
    } else {
      cardsResult.rows.forEach(card => {
        console.log(`   #${card.id} → Section #${card.section_id} (${card.section_type})`);
        console.log(`      Titre: "${card.title || '(sans titre)'}"`);
        console.log(`      Media: ${card.media_url || 'Aucun'}`);
        if (card.event_date) {
          console.log(`      Date événement: ${new Date(card.event_date).toLocaleDateString('fr-FR')}`);
        }
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
    
    // 5. STATISTIQUES
    console.log('\n📊 STATISTIQUES:\n');
    console.log(`   Sections:        ${sectionsResult.rows.length}`);
    console.log(`   section_content: ${contentResult.rows.length}`);
    console.log(`   cards_v2:        ${cardsResult.rows.length}`);
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
