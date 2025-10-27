import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { logout } from '../../../src/controllers/authController.js';

describe('authController.logout', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = {
      clearCookie: jest.fn(),
      json: jest.fn(),
    };
    process.env.NODE_ENV = 'test';
  });

  it('supprime le cookie refresh_token et retourne un message de confirmation', () => {
    logout(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'strict',
    }));
    expect(res.json).toHaveBeenCalledWith({ message: expect.stringMatching(/r\u00e9ussie/i) });
  });
});
