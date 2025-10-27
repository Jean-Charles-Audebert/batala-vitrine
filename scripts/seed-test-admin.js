// Script pour créer un admin de test (E2E Playwright)
import { query } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

async function seedTestAdmin() {
  const email = 'admin@batala.fr';
  const password = 'SecureP@ss123';
  const passwordHash = await hashPassword(password);

  await query(
    `INSERT INTO admins (email, password_hash, is_active)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE`,
    [email, passwordHash]
  );
  console.log(`✅ Admin de test créé/mis à jour: ${email}`);
  process.exit(0);
}

seedTestAdmin().catch((err) => {
  console.error('❌ Erreur lors du seed:', err);
  process.exit(1);
});
