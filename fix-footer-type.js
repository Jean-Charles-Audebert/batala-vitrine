import { pool } from './src/config/db.js';

async function fixFooterType() {
  try {
    const result = await pool.query(
      "UPDATE sections SET type = 'footer' WHERE position = 999"
    );
    console.log('✅ Footer type updated to "footer"');
    console.log('Rows affected:', result.rowCount);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixFooterType();
