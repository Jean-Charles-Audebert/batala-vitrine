import express from 'express';
import {
  getPage,
  updatePage
} from '../controllers/pageController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// GET /api/page - Récupère les paramètres de la page (public)
router.get('/', getPage);

// PUT /api/page - Met à jour les paramètres de la page (authentifié)
router.put('/', requireAuth, updatePage);

export default router;