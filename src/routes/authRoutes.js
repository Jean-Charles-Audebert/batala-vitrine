import express from 'express';
import { login, logout, showLoginPage, loginWeb, logoutWeb } from '../controllers/authController.js';

const router = express.Router();

// API routes (JSON)
router.post('/login', login);
router.post('/logout', logout);

// Web routes (HTML)
router.get('/login', showLoginPage);
// Nouveau chemin cohérent
router.post('/login/web', loginWeb);
router.get('/logout/web', logoutWeb);
// Alias rétro-compatibilité
router.post('/login-web', loginWeb);
router.get('/logout-web', logoutWeb);

export default router;
