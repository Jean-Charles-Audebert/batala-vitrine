import { jest } from '@jest/globals';
import { showHome } from '../../../src/controllers/homeController.js';

function createRes() {
  return {
    render: jest.fn(),
  };
}

describe('homeController.showHome', () => {
  const originalEnv = process.env.USE_SECTIONS_V2;

  afterEach(() => {
    // Restore original env
    process.env.USE_SECTIONS_V2 = originalEnv;
  });

  it('doit gérer les erreurs DB et afficher une page vide', async () => {
    const req = {};
    const res = createRes();
    const mockQuery = jest.fn();
    mockQuery.mockRejectedValue(new Error('DB error'));

    await showHome(req, res, { query: mockQuery });

    expect(res.render).toHaveBeenCalledWith('pages/index-v2', expect.objectContaining({
      title: 'Accueil',
      sections: [],
    }));
  });
});
