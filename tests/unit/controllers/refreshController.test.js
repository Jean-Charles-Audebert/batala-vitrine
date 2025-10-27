import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { refreshToken } from '../../../src/controllers/refreshController.js';

describe('refreshController.refreshToken', () => {
  let req, res;
  beforeEach(() => {
    req = { cookies: { refresh_token: 'refresh.jwt' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_REFRESH_SECRET = 'testrefresh';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retourne 401 si pas de cookie', async () => {
    await refreshToken({ cookies: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('retourne 401 si token invalide', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('retourne un accessToken si refresh OK', async () => {
    const payload = { sub: 1, email: 'admin@batala.fr' };
    jest.spyOn(jwt, 'verify').mockReturnValue(payload);
    jest.spyOn(jwt, 'sign').mockReturnValue('access.jwt');
    await refreshToken(req, res);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access.jwt' });
  });
});
