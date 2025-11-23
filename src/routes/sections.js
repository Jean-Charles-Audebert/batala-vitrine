import express from 'express';
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionsController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes CRUD pour les sections
router.get('/', getSections);
router.get('/:id', getSection);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;