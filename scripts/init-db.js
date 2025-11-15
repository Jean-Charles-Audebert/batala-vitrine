#!/usr/bin/env node
/**
 * Script d'initialisation de la base de données pour la production
 * Exécute les scripts SQL si les tables n'existent pas
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

async function initDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');

    // Vérifier si les tables existent
    const pageExists = await tableExists('page');
    const blocksExists = await tableExists('blocks');
    const adminsExists = await tableExists('admins');

    if (pageExists && blocksExists && adminsExists) {
      console.log('✅ Base de données déjà initialisée');
      return;
    }

    console.log('📦 Initialisation de la base de données...');

    // Exécuter le schéma
    const schemaPath = join(__dirname, '..', 'db', '001_schema.sql');
    await runSqlFile(schemaPath);

    // Exécuter le seed
    const seedPath = join(__dirname, '..', 'db', '002_seed.sql');
    await runSqlFile(seedPath);

    // Exécuter toutes les migrations dans l'ordre
    const migrations = [
      '003_add_description_bg_color.sql',
      '004_add_custom_fonts.sql',
      '005_add_custom_font_urls.sql',
      '006_simplify_fonts.sql',
      '007_add_media_types.sql',
      '008_make_card_title_nullable.sql',
      '009_add_media_path_original.sql',
      '010_remove_media_path_original.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = join(__dirname, '..', 'db', migrationFile);
      try {
        await runSqlFile(migrationPath);
      } catch (error) {
        // Continuer si la migration échoue (peut-être déjà appliquée)
        console.warn(`⚠️  Migration ${migrationFile} échouée (peut-être déjà appliquée)`);
      }
    }

    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Retry logic pour attendre que PostgreSQL soit prêt
async function waitForDatabase(maxRetries = 30, delayMs = 1000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Connexion PostgreSQL établie');
      return;
    } catch (error) {
      if (i === maxRetries) {
        console.error('❌ Impossible de se connecter à PostgreSQL');
        throw error;
      }
      console.log(`⏳ Attente PostgreSQL (tentative ${i}/${maxRetries})...`);
      await new Promise(resolve => {
        globalThis.setTimeout(resolve, delayMs);
      });
    }
  }
}

(async () => {
  await waitForDatabase();
  await initDatabase();
})();
