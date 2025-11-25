import express from 'express';
import { showEditor } from '../controllers/editorController.js';
import { buildEditorData } from '../services/pageBuilder.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// Route pour l'interface d'édition (nécessite authentification)
router.get('/', requireAuth, showEditor);

// Route pour servir le CSS dynamique des variables
router.get('/css/pages/dynamic-variables.css', requireAuth, async (req, res) => {
  try {
    // Récupérer les données de l'éditeur
    const pageData = await buildEditorData();

    res.setHeader('Content-Type', 'text/css');
    res.render('css/pages/dynamic-variables.css', {
      pageData: pageData,
      layout: false
    });
  } catch (error) {
    // En cas d'erreur, servir un CSS vide
    res.setHeader('Content-Type', 'text/css');
    res.send(':root {}');
  }
});

export default router;