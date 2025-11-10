import { jest } from '@jest/globals';
import { showHome } from '../../../src/controllers/homeController.js';

function createRes() {
  return {
    render: jest.fn(),
  };
}

describe('homeController.showHome', () => {
  it('doit rendre la vue pages/index avec les blocs de la DB', async () => {
    const req = {};
    const res = createRes();
    const mockQuery = jest.fn();
    const mockBlocks = [
      { id: 1, type: 'header', title: 'En-tête', slug: 'header', position: 1 },
      { id: 2, type: 'actus', title: 'Actualités', slug: 'actualites', position: 2 },
    ];
    const mockPageSettings = {
      id: 1,
      theme: { bg_color: '#ffffff', text_color: '#333333' },
      bg_image: null
    };
    // 1) SELECT current_database(); 2) SELECT page; 3) SELECT blocks; 4) SELECT cards
    mockQuery
      // 1) SELECT current_database()
      .mockResolvedValueOnce({ rows: [{ current_database: 'batala_vitrine' }] })
      // 2) SELECT * FROM page
      .mockResolvedValueOnce({ rows: [mockPageSettings] })
      // 3) SELECT ... FROM blocks
      .mockResolvedValueOnce({ rows: mockBlocks })
      // 4) SELECT ... FROM cards WHERE block_id=$1 for the 'actus' block
      .mockResolvedValueOnce({ rows: [] });

    await showHome(req, res, { query: mockQuery });

    expect(res.render).toHaveBeenCalledWith('pages/index', expect.objectContaining({
      title: 'Accueil',
      blocks: mockBlocks,
      pageSettings: mockPageSettings,
    }));
  });

  it('doit gérer les erreurs DB et afficher une page vide', async () => {
    const req = {};
    const res = createRes();
    const mockQuery = jest.fn();
    mockQuery.mockRejectedValue(new Error('DB error'));

    await showHome(req, res, { query: mockQuery });

    expect(res.render).toHaveBeenCalledWith('pages/index', expect.objectContaining({
      title: 'Accueil',
      blocks: [],
    }));
  });
});
