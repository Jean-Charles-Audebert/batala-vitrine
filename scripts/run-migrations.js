#!/usr/bin/env node
/**
 * Script de migration intelligent avec tracking
 * Applique uniquement les migrations non encore exécutées
 */

import { readdir, readFile } from 'fs/promises';
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

async function ensureMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        migration_file VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('📋 Table migrations_log prête');
  } catch (error) {
    console.error('❌ Erreur création table migrations_log:', error.message);
    throw error;
  }
}

async function getMigrationHistory() {
  try {
    const result = await pool.query(
      'SELECT migration_file FROM migrations_log ORDER BY applied_at'
    );
    return new Set(result.rows.map(row => row.migration_file));
  } catch (error) {
    console.error('❌ Erreur lecture historique:', error.message);
    return new Set();
  }
}

async function recordMigration(filename) {
  try {
    await pool.query(
      'INSERT INTO migrations_log (migration_file) VALUES ($1) ON CONFLICT (migration_file) DO NOTHING',
      [filename]
    );
  } catch (error) {
    console.error(`❌ Erreur enregistrement migration ${filename}:`, error.message);
  }
}

async function runMigration(filePath, filename) {
  try {
    const sql = await readFile(filePath, 'utf-8');
    await pool.query(sql);
    await recordMigration(filename);
    console.log(`   ✅ ${filename} appliquée`);
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur ${filename}:`, error.message);
    return false;
  }
}

async function applyMigrations() {
  try {
    console.log('🔄 Application des migrations...');

    // S'assurer que la table de tracking existe
    await ensureMigrationsTable();

    // Récupérer l'historique
    const appliedMigrations = await getMigrationHistory();
    console.log(`📊 Migrations déjà appliquées: ${appliedMigrations.size}`);

    // Lire tous les fichiers SQL dans db/
    const dbDir = join(__dirname, '..', 'db');
    const files = await readdir(dbDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Tri alphabétique = ordre numérique

    console.log(`📂 Fichiers de migration trouvés: ${sqlFiles.length}`);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const filename of sqlFiles) {
      if (appliedMigrations.has(filename)) {
        console.log(`⏭️  Ignoré (déjà appliqué): ${filename}`);
        skippedCount++;
        continue;
      }

      console.log(`▶️  Application: ${filename}`);
      const filePath = join(dbDir, filename);
      const success = await runMigration(filePath, filename);
      
      if (success) {
        appliedCount++;
      }
    }

    console.log('');
    console.log(`✅ Migrations terminées: ${appliedCount} appliquées, ${skippedCount} ignorées`);
    
    // Afficher l'état final
    const finalHistory = await getMigrationHistory();
    console.log('');
    console.log('📊 État final des migrations:');
    const historyResult = await pool.query(
      'SELECT migration_file, applied_at FROM migrations_log ORDER BY applied_at'
    );
    historyResult.rows.forEach(row => {
      console.log(`   - ${row.migration_file} (${row.applied_at.toISOString()})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur application migrations:', error);
    throw error;
  }
}

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
  try {
    await waitForDatabase();
    await applyMigrations();
    process.exit(0);
  } catch (error) {
    console.error('💥 Échec des migrations');
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
