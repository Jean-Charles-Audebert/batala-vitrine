import { jest } from '@jest/globals';
import { showHome } from '../../../src/controllers/homeController.js';

function createRes() {
  return {
    render: jest.fn(),
  };
}

describe('homeController.showHome', () => {
  it('doit rendre la vue index avec les blocs de la DB', async () => {
    const req = {};
    const res = createRes();
    const mockQuery = jest.fn();
    const mockBlocks = [
      { id: 1, type: 'header', title: 'En-tête', slug: 'header', position: 1 },
      { id: 2, type: 'actus', title: 'Actualités', slug: 'actualites', position: 2 },
    ];
    mockQuery.mockResolvedValue({ rows: mockBlocks });

    await showHome(req, res, { query: mockQuery });

    expect(res.render).toHaveBeenCalledWith('index', expect.objectContaining({
      title: 'Batala La Rochelle',
      blocks: mockBlocks,
    }));
  });

  it('doit gérer les erreurs DB et afficher une page vide', async () => {
    const req = {};
    const res = createRes();
    const mockQuery = jest.fn();
    mockQuery.mockRejectedValue(new Error('DB error'));

    await showHome(req, res, { query: mockQuery });

    expect(res.render).toHaveBeenCalledWith('index', expect.objectContaining({
      title: 'Batala La Rochelle',
      blocks: [],
    }));
  });
});
