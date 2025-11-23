import express from "express";
import { showPage, showEditor, saveConfig, getConfig, getSchemas } from "../controllers/pageController.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

// Routes pour les pages avec configuration JSON
router.get("/page", optionalAuth, showPage);
router.get("/editor", optionalAuth, showEditor);

// API routes pour l'éditeur
router.get("/api/site-config", optionalAuth, getConfig);
router.get("/api/schemas", optionalAuth, getSchemas);
router.post("/api/site-config", optionalAuth, saveConfig);

export default router;