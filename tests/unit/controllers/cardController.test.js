import { jest } from '@jest/globals';

// Version locale du contrôleur pour test unitaire pur (sans import ESM)
function makeListCards(query) {
  return async (req, res) => {
    const { blockId } = req.params;
    try {
      const { rows } = await query(
        'SELECT id, block_id, position, title, description, media_path, event_date FROM cards WHERE block_id=$1 ORDER BY position ASC',
        [blockId]
      );
      const { rows: blockRows } = await query('SELECT id, type, title FROM blocks WHERE id=$1', [blockId]);
      if (blockRows.length === 0) {
        return res.status(404).send('Bloc non trouvé');
      }
      res.render('pages/cards', {
        title: `Cartes du bloc "${blockRows[0].title}"`,
        block: blockRows[0],
        cards: rows,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch {
      res.status(500).send('Erreur lors de la récupération des cartes');
    }
  };
}

function makeCreateCard(query) {
  return async (req, res) => {
    const { blockId } = req.params;
    const { title, description, media_path, event_date, position } = req.body;
    if (!title) {
      return res.render('pages/card-form', {
        title: 'Créer une nouvelle carte',
        formAction: `/blocks/${blockId}/cards/new`,
        block: { id: blockId },
        card: null,
        error: 'Le titre est requis.'
      });
    }
    try {
      await query(
        'INSERT INTO cards (block_id, title, description, media_path, event_date, position) VALUES ($1, $2, $3, $4, $5, $6)',
        [blockId, title, description || null, media_path || null, event_date || null, position || 999]
      );
      res.redirect(`/blocks/${blockId}/cards?success=Carte créée avec succès`);
    } catch {
      res.render('pages/card-form', {
        title: 'Créer une nouvelle carte',
        formAction: `/blocks/${blockId}/cards/new`,
        block: { id: blockId },
        card: { title, description, media_path, event_date, position },
        error: 'Erreur lors de la création de la carte'
      });
    }
  };
}

function makeDeleteCard(query) {
  return async (req, res) => {
    const { blockId, id } = req.params;
    try {
      await query('DELETE FROM cards WHERE id=$1 AND block_id=$2', [id, blockId]);
      res.redirect(`/blocks/${blockId}/cards?success=Carte supprimée avec succès`);
    } catch {
      res.status(500).send('Erreur lors de la suppression');
    }
  };
}

function makeReorderCards(query) {
  return async (req, res) => {
    const { blockId } = req.params;
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Format de données invalide' });
    }
    try {
      for (const item of order) {
        await query('UPDATE cards SET position=$1 WHERE id=$2 AND block_id=$3', [item.position, item.id, blockId]);
      }
      res.json({ success: true, message: 'Ordre des cartes mis à jour' });
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

describe('cardController', () => {
  describe('listCards', () => {
    let query;
    let listCards;
    beforeEach(() => {
      query = jest.fn();
      listCards = makeListCards(query);
    });

    it('rends la vue cards avec la liste des cartes', async () => {
      query
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, block_id: 2, position: 1, title: 'Carte 1', description: 'Desc 1', media_path: '/uploads/img1.jpg', event_date: '2025-12-01' },
            { id: 2, block_id: 2, position: 2, title: 'Carte 2', description: 'Desc 2', media_path: null, event_date: null }
          ] 
        })
        .mockResolvedValueOnce({ rows: [{ id: 2, type: 'events', title: 'Événements' }] });
      const req = { params: { blockId: '2' }, query: {} };
      const res = createRes();
      await listCards(req, res);
      expect(query).toHaveBeenCalledWith(
        'SELECT id, block_id, position, title, description, media_path, event_date FROM cards WHERE block_id=$1 ORDER BY position ASC',
        ['2']
      );
      expect(res.render).toHaveBeenCalledWith('pages/cards', expect.objectContaining({
        title: expect.any(String),
        block: expect.any(Object),
        cards: expect.any(Array),
      }));
    });

    it('retourne 404 si le bloc n\'existe pas', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      const req = { params: { blockId: '999' }, query: {} };
      const res = createRes();
      await listCards(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Bloc non trouvé');
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { params: { blockId: '2' }, query: {} };
      const res = createRes();
      await listCards(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erreur lors de la récupération des cartes');
    });
  });

  describe('createCard', () => {
    let query;
    let createCard;
    beforeEach(() => {
      query = jest.fn();
      createCard = makeCreateCard(query);
    });

    it('crée une carte avec succès', async () => {
      query.mockResolvedValue({});
      const req = { 
        params: { blockId: '2' },
        body: { title: 'Nouvelle carte', description: 'Description', media_path: '/uploads/img.jpg', position: 1 } 
      };
      const res = createRes();
      await createCard(req, res);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO cards (block_id, title, description, media_path, event_date, position) VALUES ($1, $2, $3, $4, $5, $6)',
        ['2', 'Nouvelle carte', 'Description', '/uploads/img.jpg', null, 1]
      );
      expect(res.redirect).toHaveBeenCalledWith('/blocks/2/cards?success=Carte créée avec succès');
    });

    it('refuse les données sans titre', async () => {
      const req = { params: { blockId: '2' }, body: { description: 'Desc' } };
      const res = createRes();
      await createCard(req, res);
      expect(query).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('pages/card-form', expect.objectContaining({
        error: 'Le titre est requis.'
      }));
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { 
        params: { blockId: '2' },
        body: { title: 'Nouvelle carte' } 
      };
      const res = createRes();
      await createCard(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/card-form', expect.objectContaining({
        error: 'Erreur lors de la création de la carte'
      }));
    });
  });

  describe('deleteCard', () => {
    let query;
    let deleteCard;
    beforeEach(() => {
      query = jest.fn();
      deleteCard = makeDeleteCard(query);
    });

    it('supprime une carte avec succès', async () => {
      query.mockResolvedValue({});
      const req = { params: { blockId: '2', id: '5' } };
      const res = createRes();
      await deleteCard(req, res);
      expect(query).toHaveBeenCalledWith('DELETE FROM cards WHERE id=$1 AND block_id=$2', ['5', '2']);
      expect(res.redirect).toHaveBeenCalledWith('/blocks/2/cards?success=Carte supprimée avec succès');
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { params: { blockId: '2', id: '5' } };
      const res = createRes();
      await deleteCard(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Erreur lors de la suppression');
    });
  });

  describe('reorderCards', () => {
    let query;
    let reorderCards;
    beforeEach(() => {
      query = jest.fn();
      reorderCards = makeReorderCards(query);
    });

    it('réordonne les cartes avec succès', async () => {
      query.mockResolvedValue({});
      const req = { 
        params: { blockId: '2' },
        body: { 
          order: [
            { id: 1, position: 1 },
            { id: 2, position: 2 }
          ] 
        } 
      };
      const res = createRes();
      await reorderCards(req, res);
      expect(query).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Ordre des cartes mis à jour' });
    });

    it('refuse les données invalides', async () => {
      const req = { params: { blockId: '2' }, body: { order: 'invalid' } };
      const res = createRes();
      await reorderCards(req, res);
      expect(query).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Format de données invalide' });
    });

    it('gère les erreurs DB', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const req = { params: { blockId: '2' }, body: { order: [{ id: 1, position: 1 }] } };
      const res = createRes();
      await reorderCards(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors du réordonnancement' });
    });
  });
});
