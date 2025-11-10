import argon2 from 'argon2';

const hash = '$argon2id$v=19$m=65536,t=3,p=4$T+ptavBGgyk2ox+u+ZF46g$u9zuOPKAXB2uRRu3pM30Vk/2KpAcQx+4cQiVbOI0mCU';
const password = 'SecureP@ss123';

try {
  const result = await argon2.verify(hash, password);
  console.log('✓ Vérification du mot de passe:', result ? 'SUCCÈS ✅' : 'ÉCHEC ❌');
} catch (error) {
  console.error('✗ Erreur:', error.message);
}
