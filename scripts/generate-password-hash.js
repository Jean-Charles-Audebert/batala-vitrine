import argon2 from 'argon2';

const password = 'SecureP@ss123';

try {
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  console.log('Nouveau hash pour SecureP@ss123:');
  console.log(hash);
  console.log('\nMettez à jour db/002_seed.sql avec ce hash.');
} catch (error) {
  console.error('Erreur:', error.message);
}
