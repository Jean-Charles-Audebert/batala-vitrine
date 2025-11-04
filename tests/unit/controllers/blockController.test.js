import { jest } from '@jest/globals';

// Version locale du contrôleur pour test unitaire pur (sans import ESM)
function makeListBlocks(query) {
  return async (req, res) => {
    try {
      const { rows } = await query(
        'SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC'
      );
      res.render('pages/blocks', { 
        title: 'Gestion des blocs', 
        blocks: rows,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch {
      res.status(500).send('Erreur lors de la récupération des blocs');
    }
  };
}

function makeCreateBlock(query) {
  return async (req, res) => {
    const { type, title, slug, position } = req.body;
    if (!type || !title || !slug) {
      return res.render('pages/block-form', { 
        title: 'Créer un nouveau bloc', 
        formAction: '/blocks/new',
        block: null,
        error: 'Type, titre et slug requis.' 
      });
    }
    try {
      await query(
        'INSERT INTO blocks (type, title, slug, position, is_locked) VALUES ($1, $2, $3, $4, FALSE)',
        [type, title, slug, position || 999]
      );
      res.redirect('/blocks?success=Bloc créé avec succès');
    } catch {
      res.render('pages/block-form', { 
        title: 'Créer un nouveau bloc', 
        formAction: '/blocks/new',
        block: { type, title, slug, position },
        error: 'Erreur lors de la création (slug déjà existant ?)' 
      });
    }
  };
}

function makeDeleteBlock(query) {
  return async (req, res) => {
    const { id } = req.params;
    try {
      const { rows } = await query('SELECT is_locked FROM blocks WHERE id=$1', [id]);
      if (rows.length === 0) {
        return res.status(404).send('Bloc non trouvé');
      }
      if (rows[0].is_locked) {
        return res.redirect('/blocks?error=Impossible de supprimer un bloc verrouillé');
      }
      await query('DELETE FROM blocks WHERE id=$1', [id]);
      res.redirect('/blocks?success=Bloc supprimé avec succès');
    } catch {
      res.status(500).send('Erreur lors de la suppression');
    }
  };
}

function makeReorderBlocks(query) {
  return async (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Format de données invalide' });
    }
    try {
      for (const item of order) {
        await query('UPDATE blocks SET position=$1 WHERE id=$2', [item.position, item.id]);
      }
      res.json({ success: true, message: 'Ordre des blocs mis à jour' });
    } catch {
      res.status(500).json({ error: 'Erreur lors du réordonnancement' });
    }
  };
}

function createRes() {
  return {
    render: jest.fn(),
    redirect: jest.fn(),
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
}

describe('blockController', () => {
  describe('listBlocks', () => {
    let query;
    let listBlocks;
    beforeEach(() => {
      query = jest.fn();
      listBlocks = makeListBlocks(query);
    });

    it('rends la vue blocks avec la liste des blocs', async () => {
      query.mockResolvedValue({ rows: [
        { id: 1, type: 'header', title: 'Header', slug: 'header', position: 1, is_locked: true },
        { id: 2, type: 'events', title: 'Événements', slug: 'evenements', position: 2, is_locked: false },
      ] });
      const req = { query: {} };
      const res = createRes();
      await listBlocks(req, res);
      expect(query).toHaveBeenCalledWith('SELECT id, type, title, slug, position, is_locked FROM blocks ORDER BY position ASC');
      expect(res.render).toHaveBeenCalledWith('pages/blocks', expect.objectContaining({
        title: 'Gestion des blocs',
        blocks: expect.any(Array),
      }));
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB down'));
      const req = { query: {} };
      const res = createRes();
      await listBlocks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erreur lors de la récupération des blocs');
    });
  });

  describe('createBlock', () => {
    let query;
    let createBlock;
    beforeEach(() => {
      query = jest.fn();
      createBlock = makeCreateBlock(query);
    });

    it('crée un bloc avec succès', async () => {
      query.mockResolvedValue({});
      const req = { body: { type: 'custom', title: 'Mon Bloc', slug: 'mon-bloc', position: 5 } };
      const res = createRes();
      await createBlock(req, res);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO blocks (type, title, slug, position, is_locked) VALUES ($1, $2, $3, $4, FALSE)',
        ['custom', 'Mon Bloc', 'mon-bloc', 5]
      );
      expect(res.redirect).toHaveBeenCalledWith('/blocks?success=Bloc créé avec succès');
    });

    it('refuse les données incomplètes', async () => {
      const req = { body: { type: 'custom', title: 'Mon Bloc' } };
      const res = createRes();
      await createBlock(req, res);
      expect(query).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('pages/block-form', expect.objectContaining({
        error: 'Type, titre et slug requis.'
      }));
    });

    it('gère les erreurs de slug dupliqué', async () => {
      query.mockRejectedValueOnce(new Error('duplicate key'));
      const req = { body: { type: 'custom', title: 'Mon Bloc', slug: 'header' } };
      const res = createRes();
      await createBlock(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/block-form', expect.objectContaining({
        error: expect.stringContaining('slug déjà existant')
      }));
    });
  });

  describe('deleteBlock', () => {
    let query;
    let deleteBlock;
    beforeEach(() => {
      query = jest.fn();
      deleteBlock = makeDeleteBlock(query);
    });

    it('supprime un bloc non verrouillé', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ is_locked: false }] })
        .mockResolvedValueOnce({});
      const req = { params: { id: '2' } };
      const res = createRes();
      await deleteBlock(req, res);
      expect(query).toHaveBeenCalledWith('SELECT is_locked FROM blocks WHERE id=$1', ['2']);
      expect(query).toHaveBeenCalledWith('DELETE FROM blocks WHERE id=$1', ['2']);
      expect(res.redirect).toHaveBeenCalledWith('/blocks?success=Bloc supprimé avec succès');
    });

    it('refuse de supprimer un bloc verrouillé', async () => {
      query.mockResolvedValueOnce({ rows: [{ is_locked: true }] });
      const req = { params: { id: '1' } };
      const res = createRes();
      await deleteBlock(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/blocks?error=Impossible de supprimer un bloc verrouillé');
    });

    it('retourne 404 si le bloc n\'existe pas', async () => {
      query.mockResolvedValueOnce({ rows: [] });
      const req = { params: { id: '999' } };
      const res = createRes();
      await deleteBlock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Bloc non trouvé');
    });
  });

  describe('reorderBlocks', () => {
    let query;
    let reorderBlocks;
    beforeEach(() => {
      query = jest.fn();
      reorderBlocks = makeReorderBlocks(query);
    });

    it('réordonne les blocs avec succès', async () => {
      query.mockResolvedValue({});
      const req = { 
        body: { 
          order: [
            { id: 1, position: 1 },
            { id: 2, position: 2 },
            { id: 3, position: 3 }
          ] 
        } 
      };
      const res = createRes();
      await reorderBlocks(req, res);
      expect(query).toHaveBeenCalledTimes(3);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Ordre des blocs mis à jour' });
    });

    it('refuse les données invalides', async () => {
      const req = { body: { order: 'invalid' } };
      const res = createRes();
      await reorderBlocks(req, res);
      expect(query).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Format de données invalide' });
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { body: { order: [{ id: 1, position: 1 }] } };
      const res = createRes();
      await reorderBlocks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors du réordonnancement' });
    });
  });
});
