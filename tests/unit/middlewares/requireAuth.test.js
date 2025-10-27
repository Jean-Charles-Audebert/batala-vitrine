import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../../../src/middlewares/requireAuth.js';

describe('requireAuth middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'testsecret';
  });

  it('retourne 401 si Authorization manquant', () => {
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si Authorization ne commence pas par Bearer', () => {
    req.headers.authorization = 'Basic xyz';
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 401 si token invalide', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    jwt.verify.mockRestore();
  });

  it('attache req.user et appelle next si token valide', () => {
    const payload = { sub: 1, email: 'admin@batala.fr' };
    req.headers.authorization = 'Bearer validtoken';
    jest.spyOn(jwt, 'verify').mockReturnValue(payload);
    requireAuth(req, res, next);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    jwt.verify.mockRestore();
  });
});
