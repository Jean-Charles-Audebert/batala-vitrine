/**
 * Script de migration: blocks/cards → sections/section_content
 * 
 * Stratégie:
 * 1. Identifier le type de bloc (header → hero, default → content, footer → footer)
 * 2. Créer une section correspondante avec les styles
 * 3. Migrer les cards vers section_content ou cards_v2 selon le contexte
 * 4. Conserver les anciennes tables (rollback possible)
 */

import { query } from '../src/config/db.js';
import 'dotenv/config';

console.log('🚀 Migration blocks → sections\n');

async function migrateBlocksToSections() {
  try {
    // 1. RÉCUPÉRER TOUS LES BLOCKS EXISTANTS
    console.log('📦 Récupération des blocks existants...');
    const blocksResult = await query(`
      SELECT 
        id, 
        type, 
        title, 
        position, 
        bg_color, 
        bg_image,
        is_transparent,
        created_at
      FROM blocks 
      ORDER BY position ASC
    `);
    
    const blocks = blocksResult.rows;
    console.log(`   → ${blocks.length} blocks trouvés\n`);
    
    if (blocks.length === 0) {
      console.log('⚠️  Aucun block à migrer. Base vide ou déjà migrée.\n');
      return;
    }
    
    // 2. MIGRER CHAQUE BLOCK VERS SECTION
    for (const block of blocks) {
      console.log(`📝 Migration du block #${block.id} (${block.type})...`);
      
      // Déterminer le type de section
      let sectionType;
      let layout = null;
      
      switch (block.type) {
        case 'header':
          sectionType = 'hero';
          layout = 'centered';
          break;
        case 'footer':
          sectionType = 'footer';
          break;
        case 'default':
        default: {
          // Analyser les cards pour déterminer si c'est content ou card_grid
          const cardsCount = await query(
            'SELECT COUNT(*) as count FROM cards WHERE block_id = $1',
            [block.id]
          );
          
          if (cardsCount.rows[0].count > 3) {
            sectionType = 'card_grid';
            layout = 'grid_3';
          } else if (cardsCount.rows[0].count === 1) {
            sectionType = 'content';
            layout = 'image_left'; // Par défaut, ajustable après
          } else {
            sectionType = 'content';
            layout = 'centered';
          }
          break;
        }
      }
      
      // Créer la section
      const sectionResult = await query(`
        INSERT INTO sections (
          type,
          title,
          position,
          bg_color,
          bg_image,
          is_transparent,
          layout,
          padding_top,
          padding_bottom,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        sectionType,
        block.title || `Section ${block.position}`,
        block.position,
        block.bg_color,
        block.bg_image,
        block.is_transparent || false,
        layout,
        'medium',
        'medium',
        block.created_at
      ]);
      
      const sectionId = sectionResult.rows[0].id;
      console.log(`   ✅ Section #${sectionId} créée (type: ${sectionType})`);
      
      // 3. MIGRER LES CARDS ASSOCIÉES
      const cardsResult = await query(`
        SELECT 
          id,
          title,
          description,
          media_path,
          template,
          media_type,
          event_date,
          position,
          description_bg_color,
          created_at
        FROM cards 
        WHERE block_id = $1
        ORDER BY position ASC
      `, [block.id]);
      
      const cards = cardsResult.rows;
      
      if (cards.length > 0) {
        console.log(`   📇 Migration de ${cards.length} card(s)...`);
        
        for (const card of cards) {
          // Déterminer la destination selon le type de section
          if (sectionType === 'card_grid' || sectionType === 'gallery') {
            // Migrer vers cards_v2
            await query(`
              INSERT INTO cards_v2 (
                section_id,
                title,
                description,
                media_url,
                media_type,
                event_date,
                position,
                bg_color,
                created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              sectionId,
              card.title,
              card.description,
              card.media_path,
              card.media_type || 'image',
              card.event_date,
              card.position,
              card.description_bg_color,
              card.created_at
            ]);
            
            console.log(`      → Card "${card.title || '(sans titre)'}" → cards_v2`);
            
          } else if (sectionType === 'content' || sectionType === 'hero') {
            // Migrer vers section_content
            
            // Détecter la taille du média selon le template
            let mediaSize = 'medium';
            if (card.template === 'photo' || card.template === 'video') {
              mediaSize = 'large';
            }
            
            // Détecter le layout si possible
            if (card.template === 'image_left') {
              await query(`
                UPDATE sections 
                SET layout = 'image_left' 
                WHERE id = $1
              `, [sectionId]);
            } else if (card.template === 'image_right') {
              await query(`
                UPDATE sections 
                SET layout = 'image_right' 
                WHERE id = $1
              `, [sectionId]);
            }
            
            await query(`
              INSERT INTO section_content (
                section_id,
                title,
                description,
                media_url,
                media_type,
                media_size,
                position,
                bg_color,
                created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              sectionId,
              card.title,
              card.description,
              card.media_path,
              card.media_type || 'image',
              mediaSize,
              card.position,
              card.description_bg_color,
              card.created_at
            ]);
            
            console.log(`      → Card "${card.title || '(sans titre)'}" → section_content`);
          }
        }
      }
      
      console.log('');
    }
    
    // 4. RÉCAPITULATIF
    console.log('📊 Récapitulatif de la migration:\n');
    
    const sectionsCount = await query('SELECT COUNT(*) as count FROM sections');
    console.log(`   Sections créées:       ${sectionsCount.rows[0].count}`);
    
    const contentCount = await query('SELECT COUNT(*) as count FROM section_content');
    console.log(`   section_content:       ${contentCount.rows[0].count}`);
    
    const cardsV2Count = await query('SELECT COUNT(*) as count FROM cards_v2');
    console.log(`   cards_v2:              ${cardsV2Count.rows[0].count}`);
    
    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifier les données avec: node scripts/check-sections.js');
    console.log('   2. Activer le feature flag: USE_SECTIONS_V2=true dans .env');
    console.log('   3. Tester l\'affichage sur /');
    console.log('   4. Si OK, supprimer les anciennes tables avec: node scripts/cleanup-old-tables.js\n');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Exécution
migrateBlocksToSections();
