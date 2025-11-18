/**
 * Routes admin pour les sections v2
 */

import { Router } from 'express';
import { listSections } from '../controllers/sectionAdminController.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

// Protection auth pour toutes les routes
router.use(requireAuth);

// GET /sections - Page admin liste des sections
router.get('/', listSections);

export default router;
