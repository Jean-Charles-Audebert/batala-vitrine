import express from "express";
import { reorderBlocks } from "../controllers/blockController.js";
import { reorderCards, getCardJson, updateCardJson, createCardJson } from "../controllers/cardController.js";
import { getFooterElementJson, listFooterElementsJson, upsertFooterElementJson, deleteFooterElementJson } from "../controllers/footerElementController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { upload, handleMulterError } from "../config/upload.js";
import { logger } from "../utils/logger.js";
import { createOptimizedVersion } from "../utils/imageOptimizer.js";
import { query } from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Note: La route /api/contact est définie directement dans server.js pour éviter les conflits d'authentification

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

      // Créer version optimisée SANS suffixe (fichier uploadé a -original)
      let optimizedPath;
      try {
        optimizedPath = await createOptimizedVersion(uploadedFilePath, fieldName);
        logger.info(`Image optimisée créée: ${path.basename(optimizedPath)}`);
      } catch (optError) {
        logger.error("Erreur optimisation image (fichier conservé non optimisé):", optError);
        // On continue même si l'optimisation échoue
        optimizedPath = uploadedFilePath;
      }

      // Retourner le chemin de la version OPTIMISÉE (sans -original) pour stocker en BDD
      const optimizedFilename = path.basename(optimizedPath);
      const relativePath = `/uploads/${optimizedFilename}`;

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

// Route API pour supprimer un fichier uploadé
router.delete("/upload", requireAuth, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Chemin du fichier manquant.",
      });
    }

    // Vérifier que le fichier est dans /uploads/
    if (!filePath.startsWith('/uploads/')) {
      return res.status(400).json({
        success: false,
        message: "Chemin invalide (doit être dans /uploads/).",
      });
    }

    // Vérifier si le fichier est utilisé dans les tables
    const usageCheck = await query(`
      SELECT 
        (SELECT COUNT(*) FROM cards WHERE media_url = $1) +
        (SELECT COUNT(*) FROM section_content WHERE media_url = $1) +
        (SELECT COUNT(*) FROM cards_v2 WHERE media_url = $1) +
        (SELECT COUNT(*) FROM sections WHERE bg_image = $1 OR bg_video = $1 OR bg_youtube = $1) +
        (SELECT COUNT(*) FROM page WHERE header_bg_image = $1 OR main_bg_image = $1 OR footer_bg_image = $1 OR main_bg_video = $1 OR header_bg_video = $1) AS usage_count
    `, [filePath]);

    const usageCount = parseInt(usageCheck.rows[0].usage_count, 10);

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Ce fichier est encore utilisé dans ${usageCount} emplacement(s).`,
        usageCount,
      });
    }

    // Supprimer le fichier physique
    const filename = path.basename(filePath);
    const fullPath = path.join(__dirname, "../../public/uploads", filename);

    try {
      await fs.unlink(fullPath);
      logger.info(`Fichier supprimé: ${filename}`);

      // Supprimer aussi la version -original si elle existe
      const originalFilename = filename.replace(/\.([^.]+)$/, '-original.$1');
      const originalPath = path.join(__dirname, "../../public/uploads", originalFilename);
      try {
        await fs.unlink(originalPath);
        logger.info(`Version originale supprimée: ${originalFilename}`);
      } catch {
        // Pas grave si le fichier original n'existe pas
      }

      return res.status(200).json({
        success: true,
        message: "Fichier supprimé avec succès.",
      });
    } catch (fsError) {
      if (fsError.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          message: "Fichier introuvable.",
        });
      }
      throw fsError;
    }
  } catch (error) {
    logger.error("Erreur suppression fichier:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du fichier.",
    });
  }
});

export default router;
