import express from "express";
import { reorderBlocks } from "../controllers/blockController.js";
import { reorderCards, getCardJson, updateCardJson, createCardJson } from "../controllers/cardController.js";
import { getFooterElementJson, listFooterElementsJson, upsertFooterElementJson, deleteFooterElementJson } from "../controllers/footerElementController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { upload, handleMulterError } from "../config/upload.js";
import { logger } from "../utils/logger.js";
import { createOptimizedVersion } from "../utils/imageOptimizer.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Route API pour le réordonnancement des blocs
router.post("/blocks/reorder", requireAuth, reorderBlocks);

// Route API pour le réordonnancement des cartes
router.post("/blocks/:blockId/cards/reorder", requireAuth, reorderCards);

// Routes API pour CRUD cartes (édition rapide)
router.get("/blocks/:blockId/cards/:id", requireAuth, getCardJson);
router.post("/blocks/:blockId/cards/:id", requireAuth, updateCardJson);
router.post("/blocks/:blockId/cards", requireAuth, createCardJson);

// Routes API pour CRUD footer elements (édition inline)
router.get("/blocks/:blockId/footer-elements/:type", requireAuth, getFooterElementJson);
router.get("/blocks/:blockId/footer-elements/list/:type", requireAuth, listFooterElementsJson);
router.post("/blocks/:blockId/footer-elements/:type", requireAuth, upsertFooterElementJson);
router.delete("/blocks/:blockId/footer-elements/:id", requireAuth, deleteFooterElementJson);

// Route API pour l'upload d'images
router.post(
  "/upload",
  requireAuth,
  upload.single("image"),
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni.",
        });
      }

      const fieldName = req.body.fieldName || "media_path"; // Nom du champ pour détecter le preset
      const uploadedFilePath = path.join(__dirname, "../../public/uploads", req.file.filename);

      logger.info(`Image uploadée : ${req.file.filename} (${req.file.size} bytes), champ: ${fieldName}`);

      // Optimiser l'image (remplace l'original)
      try {
        await createOptimizedVersion(uploadedFilePath, fieldName);
        logger.info(`Image optimisée: ${req.file.filename}`);
      } catch (optError) {
        logger.error("Erreur optimisation image (fichier conservé non optimisé):", optError);
        // On continue même si l'optimisation échoue
      }

      // Retourner le chemin relatif pour stockage en DB
      const relativePath = `/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Image uploadée et optimisée avec succès.",
        path: relativePath,
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      logger.error("Erreur upload image:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'upload de l'image.",
      });
    }
  }
);

export default router;
