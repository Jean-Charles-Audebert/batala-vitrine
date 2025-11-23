import argon2 from 'argon2';

const password = process.argv[2] || 'admin';

try {
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  console.log(`Nouveau hash pour "${password}":`);
  console.log(hash);
  console.log('\nMettez à jour db/002_seed.sql avec ce hash.');
} catch (error) {
  console.error('Erreur:', error.message);
}
