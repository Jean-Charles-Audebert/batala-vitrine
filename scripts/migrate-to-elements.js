#!/usr/bin/env node
/**
 * Migration: Ajout de la table elements
 * Exécute le script SQL pour ajouter la table elements et migrer les données
 */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'batala_vitrine',
  max: 1,
  connectionTimeoutMillis: 5000,
});

async function tableExists(tableName) {
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      )`,
      [tableName]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Erreur vérification table ${tableName}:`, error.message);
    return false;
  }
}

async function runSqlFile(filePath) {
  try {
    const sql = await readFile(filePath, 'utf-8');
    await pool.query(sql);
    console.log(`✅ Exécuté: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur SQL ${filePath}:`, error.message);
    throw error;
  }
}

async function migrateToElements() {
  try {
    console.log('🔍 Vérification de la table elements...');

    const elementsExists = await tableExists('elements');

    if (elementsExists) {
      console.log('✅ Table elements déjà créée');
      return;
    }

    console.log('📦 Migration vers la structure elements...');

    // Exécuter le script de migration
    const migrationPath = join(__dirname, '..', 'db', '003_add_elements.sql');
    await runSqlFile(migrationPath);

    console.log('✅ Migration terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

(async () => {
  await migrateToElements();
})();