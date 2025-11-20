import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { showSettings, updateSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Afficher les paramètres
router.get('/settings', showSettings);

// Mettre à jour les paramètres
router.post('/settings', updateSettings);

export default router;