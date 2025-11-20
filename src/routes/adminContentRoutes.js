/**
 * Routes API pour le contenu dynamique du dashboard admin
 */

import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getSectionsContent } from '../controllers/adminContentController.js';
import { getAdminsContent } from '../controllers/adminContentController.js';
// import { getBlocksContent } from '../controllers/adminContentController.js'; // Supprimé - blocs plus utilisés
import { getFontsContent } from '../controllers/adminContentController.js';
import { getSettingsContent, updateSettingsContent } from '../controllers/adminContentController.js';
// import { createBlock, updateBlock, deleteBlock } from '../controllers/blockController.js'; // Supprimé - blocs plus utilisés
import { createAdminApi, updateAdminApi, deleteAdminApi } from '../controllers/adminContentController.js';

const router = Router();

// Protection auth pour toutes les routes
router.use(requireAuth);

// GET /api/admin/sections - Contenu de la section sections
router.get('/sections', getSectionsContent);

// GET /api/admin/admins - Contenu de la section admins
router.get('/admins', getAdminsContent);

// POST /api/admin/admins - Créer un admin
router.post('/admins', createAdminApi);

// PUT /api/admin/admins/:id - Modifier un admin
router.put('/admins/:id', updateAdminApi);

// DELETE /api/admin/admins/:id - Supprimer un admin
router.delete('/admins/:id', deleteAdminApi);

// GET /api/admin/fonts - Contenu de la section polices
router.get('/fonts', getFontsContent);

// GET /api/admin/settings - Contenu de la section paramètres
router.get('/settings', getSettingsContent);

// POST /api/admin/settings - Sauvegarder les paramètres
router.post('/settings', updateSettingsContent);

export default router;