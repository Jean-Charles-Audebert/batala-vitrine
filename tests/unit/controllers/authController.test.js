import { jest, beforeEach, afterEach, describe, it, expect } from '@jest/globals';
import { login } from '../../../src/controllers/authController.js';

describe('authController.login', () => {
  let req, res, mockQuery, mockVerify, mockJwt;
  beforeEach(() => {
    req = { body: { email: 'admin@batala.fr', password: 'secret' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    mockQuery = jest.fn();
    mockVerify = jest.fn();
    mockJwt = { sign: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retourne 400 si email ou password manquant', async () => {
    await login({ body: {} }, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringMatching(/requis/i) });
  });

  it('retourne 401 si admin non trouvé', async () => {
    mockQuery.mockResolvedValue({ rows: [] });
    await login(req, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringMatching(/invalides/i) });
  });

  it('retourne 401 si admin inactif', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1, email: 'admin@batala.fr', is_active: false, password_hash: 'hash' }] });
    await login(req, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retourne 401 si mot de passe invalide', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1, email: 'admin@batala.fr', is_active: true, password_hash: 'hash' }] });
    mockVerify.mockResolvedValue(false);
    await login(req, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retourne un accessToken et cookie refresh si login OK', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1, email: 'admin@batala.fr', is_active: true, password_hash: 'hash' }] });
    mockVerify.mockResolvedValue(true);
    mockJwt.sign.mockReturnValueOnce('access.jwt').mockReturnValueOnce('refresh.jwt');
    await login(req, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh.jwt', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access.jwt' });
  });

  it('retourne 500 si erreur serveur', async () => {
    mockQuery.mockRejectedValue(new Error('DB down'));
    await login(req, res, { query: mockQuery, verifyPassword: mockVerify, jwt: mockJwt });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });
});
