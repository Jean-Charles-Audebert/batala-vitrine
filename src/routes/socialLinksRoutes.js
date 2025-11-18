/**
 * Routes API pour les réseaux sociaux
 */
import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { 
  getAllSocialLinks, 
  createSocialLink, 
  updateSocialLink, 
  deleteSocialLink 
} from '../controllers/socialLinksController.js';

const router = Router();

// Protection par auth
router.use(requireAuth);

// GET /api/social-links - Liste tous les liens sociaux
router.get('/social-links', async (req, res) => {
  try {
    const links = await getAllSocialLinks();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/social-links - Créer un lien social
router.post('/social-links', async (req, res) => {
  try {
    const link = await createSocialLink(req.body);
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/social-links/:id - Mettre à jour un lien social
router.put('/social-links/:id', async (req, res) => {
  try {
    await updateSocialLink(parseInt(req.params.id, 10), req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/social-links/:id - Supprimer un lien social
router.delete('/social-links/:id', async (req, res) => {
  try {
    const success = await deleteSocialLink(parseInt(req.params.id, 10));
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
