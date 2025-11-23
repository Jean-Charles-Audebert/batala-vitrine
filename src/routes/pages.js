import express from "express";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = express.Router();

// Routes pour les pages avec configuration JSON
// TODO: Implémenter les contrôleurs pour showPage et showEditor avec la nouvelle structure
// router.get("/page", optionalAuth, showPage);
// router.get("/editor", optionalAuth, showEditor);

// API routes pour l'éditeur
// TODO: Implémenter les routes API pour la nouvelle structure
// router.get("/api/site-config", optionalAuth, getConfig);
// router.get("/api/schemas", optionalAuth, getSchemas);
// router.post("/api/site-config", optionalAuth, saveConfig);

export default router;