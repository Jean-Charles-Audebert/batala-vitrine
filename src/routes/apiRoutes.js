import express from "express";
import {
  getBlockElements,
  createBlockElement,
  updateBlockElement,
  deleteBlockElement,
} from "../controllers/blockElementController.js";
import { reorderBlocks } from "../controllers/blockController.js";
import { reorderCards } from "../controllers/cardController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { upload, handleMulterError } from "../config/upload.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Routes API pour les éléments de blocs (protégées)
router.get("/blocks/:blockId/elements", requireAuth, getBlockElements);
router.post("/blocks/:blockId/elements", requireAuth, createBlockElement);
router.put("/elements/:id", requireAuth, updateBlockElement);
router.delete("/elements/:id", requireAuth, deleteBlockElement);

// Route API pour le réordonnancement des blocs
router.post("/blocks/reorder", requireAuth, reorderBlocks);

// Route API pour le réordonnancement des cartes
router.post("/blocks/:blockId/cards/reorder", requireAuth, reorderCards);

// Route API pour l'upload d'images
router.post(
  "/upload",
  requireAuth,
  upload.single("image"),
  handleMulterError,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier fourni.",
        });
      }

      // Retourner le chemin relatif pour stockage en DB
      const relativePath = `/uploads/${req.file.filename}`;

      logger.info(`Image uploadée : ${req.file.filename} (${req.file.size} bytes)`);

      res.status(200).json({
        success: true,
        message: "Image uploadée avec succès.",
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
