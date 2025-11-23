import express from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { upload } from '../config/upload.js';
import {
  listFonts,
  showNewFontForm,
  createFont,
  showEditFontForm,
  updateFont,
  deleteFont,
  uploadFont
} from '../controllers/fontsController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Liste des polices
router.get('/', listFonts);

// Formulaire d'ajout
router.get('/new', showNewFontForm);

// Création d'une police
router.post('/new', createFont);

// Upload d'une police depuis l'ordinateur
router.post('/upload', upload.single('font_file'), uploadFont);

// Formulaire d'édition
router.get('/:id/edit', showEditFontForm);

// Mise à jour d'une police
router.post('/:id/edit', updateFont);

// Suppression d'une police
router.post('/:id/delete', deleteFont);

export default router;
