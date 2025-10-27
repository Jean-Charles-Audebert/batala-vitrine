import { hashPassword, verifyPassword } from '../../../src/utils/password.js';

describe('password utils', () => {
  it('hashPassword produit un hash argon2id', async () => {
    const hash = await hashPassword('superSecret123');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('verifyPassword valide le bon mot de passe', async () => {
    const password = 'superSecret123';
    const hash = await hashPassword(password);
    const ok = await verifyPassword(password, hash);
    expect(ok).toBe(true);
  });

  it('verifyPassword rejette un mauvais mot de passe', async () => {
    const hash = await hashPassword('superSecret123');
    const ok = await verifyPassword('badPassword', hash);
    expect(ok).toBe(false);
  });
});
