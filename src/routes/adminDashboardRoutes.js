import express from 'express';
import { showAdminDashboard } from '../controllers/adminDashboardController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = express.Router();

// Toutes les routes admin nécessitent une authentification
router.use(requireAuth);

router.get('/', showAdminDashboard);

export default router;