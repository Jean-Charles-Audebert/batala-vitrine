import express from 'express';
import {
  getElements,
  getElement,
  createElement,
  updateElement,
  deleteElement,
  updateElementPosition
} from '../controllers/elementsController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

// Routes CRUD pour les éléments
router.get('/', getElements);
router.get('/:id', getElement);
router.post('/', createElement);
router.put('/:id', updateElement);
router.put('/:id/position', updateElementPosition);
router.delete('/:id', deleteElement);

export default router;