import express from "express";
import { showHome } from "../controllers/homeController.js";
import { showEditorPage } from "../controllers/siteController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { query } from "../config/db.js";

const router = express.Router();

// Route publique - page vitrine avec sections visibles uniquement
router.get("/", optionalAuth, showHome);

// API endpoint pour preview dans l'éditeur
router.get("/api/preview", optionalAuth, showHome);

// Route d'édition - toutes les sections (authentification requise)
router.get("/editor", requireAuth, showEditorPage);

export default router;
