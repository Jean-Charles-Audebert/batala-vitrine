import { query } from '../src/config/db.js';

async function migrateElementsType() {
  try {
    console.log('Migration de la contrainte elements_type_check...');

    // Supprimer l'ancienne contrainte
    await query('ALTER TABLE elements DROP CONSTRAINT elements_type_check');

    // Ajouter la nouvelle contrainte avec 'link'
    await query("ALTER TABLE elements ADD CONSTRAINT elements_type_check CHECK (type IN ('text', 'media', 'card', 'gallery', 'youtube', 'contact', 'link'))");

    console.log('✅ Contrainte mise à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

migrateElementsType();