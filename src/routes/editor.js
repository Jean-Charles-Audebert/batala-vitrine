import express from 'express';
import { showEditor } from '../controllers/editorController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// Route pour l'interface d'édition (nécessite authentification)
router.get('/', requireAuth, showEditor);

export default router;