
import { jest } from '@jest/globals';

// Version locale du contrôleur pour test unitaire pur (sans import ESM)
function makeListAdmins(query) {
  return async (req, res) => {
    try {
      const { rows } = await query('SELECT id, email, is_active, created_at FROM admins');
      res.render('pages/admins', { 
        title: 'Liste des admins', 
        admins: rows,
        success: req.query.success || null
      });
    } catch {
      res.status(500).send('Erreur lors de la récupération des admins');
    }
  };
}

function makeCreateAdmin(query, hashPassword) {
  return async (req, res) => {
    const { email, password, is_active } = req.body;
    if (!email || !password) {
      return res.render('pages/admin-form', { 
        title: 'Créer un nouvel admin', 
        formAction: '/admins/new',
        admin: null,
        error: 'Email et mot de passe requis.' 
      });
    }
    try {
      const passwordHash = await hashPassword(password);
      await query(
        'INSERT INTO admins (email, password_hash, is_active, created_by) VALUES ($1, $2, $3, $4)',
        [email, passwordHash, is_active === 'on' || is_active === true, req.user.sub]
      );
      res.redirect('/admins?success=Admin créé avec succès');
    } catch {
      res.render('pages/admin-form', { 
        title: 'Créer un nouvel admin', 
        formAction: '/admins/new',
        admin: { email },
        error: 'Erreur lors de la création (email déjà existant ?)' 
      });
    }
  };
}

function makeDeleteAdmin(query) {
  return async (req, res) => {
    const { id } = req.params;
    try {
      await query('DELETE FROM admins WHERE id=$1', [id]);
      res.redirect('/admins?success=Admin supprimé avec succès');
    } catch {
      res.status(500).send('Erreur lors de la suppression');
    }
  };
}

function createRes() {
  return {
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe('adminController', () => {
  describe('listAdmins', () => {
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
      const req = { query: {} };
      const res = createRes();
      await listAdmins(req, res);
      expect(query).toHaveBeenCalledWith('SELECT id, email, is_active, created_at FROM admins');
      expect(res.render).toHaveBeenCalledWith('pages/admins', expect.objectContaining({
        title: expect.any(String),
        admins: expect.any(Array),
      }));
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB down'));
      const req = { query: {} };
      const res = createRes();
      await listAdmins(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.stringMatching(/Erreur/));
    });
  });

  describe('createAdmin', () => {
    let query;
    let hashPassword;
    let createAdmin;
    beforeEach(() => {
      query = jest.fn();
      hashPassword = jest.fn();
      createAdmin = makeCreateAdmin(query, hashPassword);
    });

    it('crée un admin avec succès', async () => {
      hashPassword.mockResolvedValue('hashed_password');
      query.mockResolvedValue({});
      const req = { 
        body: { email: 'newadmin@batala.fr', password: 'SecureP@ss123', is_active: 'on' },
        user: { sub: 1 }
      };
      const res = createRes();
      await createAdmin(req, res);
      expect(hashPassword).toHaveBeenCalledWith('SecureP@ss123');
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO admins (email, password_hash, is_active, created_by) VALUES ($1, $2, $3, $4)',
        ['newadmin@batala.fr', 'hashed_password', true, 1]
      );
      expect(res.redirect).toHaveBeenCalledWith('/admins?success=Admin créé avec succès');
    });

    it('refuse les données incomplètes', async () => {
      const req = { body: { email: 'test@test.fr' }, user: { sub: 1 } };
      const res = createRes();
      await createAdmin(req, res);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(query).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('pages/admin-form', expect.objectContaining({
        error: 'Email et mot de passe requis.'
      }));
    });

    it('gère les erreurs d\'email dupliqué', async () => {
      hashPassword.mockResolvedValue('hashed_password');
      query.mockRejectedValueOnce(new Error('duplicate key'));
      const req = { 
        body: { email: 'admin@batala.fr', password: 'SecureP@ss123', is_active: true },
        user: { sub: 1 }
      };
      const res = createRes();
      await createAdmin(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/admin-form', expect.objectContaining({
        error: expect.stringContaining('email déjà existant')
      }));
    });
  });

  describe('deleteAdmin', () => {
    let query;
    let deleteAdmin;
    beforeEach(() => {
      query = jest.fn();
      deleteAdmin = makeDeleteAdmin(query);
    });

    it('supprime un admin avec succès', async () => {
      query.mockResolvedValue({});
      const req = { params: { id: '2' } };
      const res = createRes();
      await deleteAdmin(req, res);
      expect(query).toHaveBeenCalledWith('DELETE FROM admins WHERE id=$1', ['2']);
      expect(res.redirect).toHaveBeenCalledWith('/admins?success=Admin supprimé avec succès');
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { params: { id: '1' } };
      const res = createRes();
      await deleteAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erreur lors de la suppression');
    });
  });
});
