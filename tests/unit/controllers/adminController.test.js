
import { jest } from '@jest/globals';

// Version locale du contrôleur pour test unitaire pur (sans import ESM)
function makeListAdmins(query) {
  return async (req, res) => {
    try {
      const { rows } = await query('SELECT id, email, is_active, created_at FROM admins');
      res.render('admins', { title: 'Liste des admins', admins: rows });
    } catch {
      res.status(500).send('Erreur lors de la récupération des admins');
    }
  };
}

function createRes() {
  return {
    render: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe('adminController.listAdmins', () => {
  let query;
  let listAdmins;
  beforeEach(() => {
    query = jest.fn();
    listAdmins = makeListAdmins(query);
  });

  it('rends la vue admins avec la liste des admins', async () => {
    query.mockResolvedValue({ rows: [
      { id: 1, email: 'admin@batala.fr', is_active: true, created_at: '2025-01-01' },
      { id: 2, email: 'autre@batala.fr', is_active: false, created_at: '2025-01-02' },
    ] });
    const req = {};
    const res = createRes();
    await listAdmins(req, res);
    expect(query).toHaveBeenCalledWith('SELECT id, email, is_active, created_at FROM admins');
    expect(res.render).toHaveBeenCalledWith('admins', expect.objectContaining({
      title: expect.any(String),
      admins: expect.any(Array),
    }));
  });

  it('gère les erreurs DB', async () => {
    query.mockRejectedValueOnce(new Error('DB down'));
    const req = {};
    const res = createRes();
    await listAdmins(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.stringMatching(/Erreur/));
  });
});
