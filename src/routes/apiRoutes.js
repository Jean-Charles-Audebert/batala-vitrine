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

    // Note: Pas de vérification d'usage ici. L'utilisateur a déjà confirmé via l'interface.
    // Si le fichier est encore utilisé ailleurs, le lien sera cassé mais l'avertissement client suffit.

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

// Routes GET pour données nécessaires à la modale hero
router.get("/fonts", requireAuth, async (req, res) => {
  try {
    const result = await query(`SELECT id, name, font_family, source FROM fonts ORDER BY name`);
    res.json(result.rows);
  } catch (error) {
    logger.error("Erreur chargement fonts:", error);
    res.status(500).json({ error: "Erreur chargement fonts" });
  }
});

router.get("/social-links", requireAuth, async (req, res) => {
  try {
    const location = req.query.location || 'footer'; // 'header', 'footer', 'both', ou 'header,both'
    const locations = location.split(',');
    
    const placeholders = locations.map((_, i) => `$${i + 1}`).join(',');
    const result = await query(
      `SELECT id, platform, url, label, is_visible 
       FROM social_links 
       WHERE location IN (${placeholders}) AND is_visible = TRUE
       ORDER BY position`,
      locations
    );
    res.json(result.rows);
  } catch (error) {
    logger.error("Erreur chargement social links:", error);
    res.status(500).json({ error: "Erreur chargement social links" });
  }
});

// Route API spéciale pour contenu hero (logo, titre, social, navigation)
router.put("/sections/:id/hero-content", requireAuth, async (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);
    const { section, content, nav_sections } = req.body;

    // 1. Mettre à jour la section (logo, positions, flags, styles)
    await query(
      `UPDATE sections SET 
        logo_url = $1, 
        logo_width = $2, 
        logo_position_h = $3, 
        logo_position_v = $4,
        show_social_links = $5, 
        social_position_h = $6, 
        social_position_v = $7,
        social_icon_size = $8,
        social_icon_color = $9,
        show_nav_links = $10, 
        nav_position_h = $11, 
        nav_position_v = $12,
        nav_text_color = $13,
        nav_bg_color = $14,
        is_sticky = $15,
        updated_at = NOW()
       WHERE id = $16`,
      [
        section.logo_url || null,
        section.logo_width || 150,
        section.logo_position_h || 'center',
        section.logo_position_v || 'center',
        section.show_social_links || false,
        section.social_position_h || 'right',
        section.social_position_v || 'top',
        section.social_icon_size || 24,
        section.social_icon_color || '#ffffff',
        section.show_nav_links || false,
        section.nav_position_h || 'right',
        section.nav_position_v || 'center',
        section.nav_text_color || '#ffffff',
        section.nav_bg_color || 'rgba(255,255,255,0.25)',
        section.is_sticky || false,
        sectionId
      ]
    );

    // 2. Upsert section_content (titre, police, couleur, position)
    const existingContent = await query(
      `SELECT id FROM section_content WHERE section_id = $1 LIMIT 1`,
      [sectionId]
    );

    if (existingContent.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE section_content SET 
          title = $1, 
          title_font_id = $2, 
          title_color = $3,
          title_position_h = $4, 
          title_position_v = $5,
          updated_at = NOW()
         WHERE section_id = $6`,
        [
          content.title || null,
          content.title_font_id || null,
          content.title_color || '#ffffff',
          content.title_position_h || 'center',
          content.title_position_v || 'center',
          sectionId
        ]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO section_content 
          (section_id, title, title_font_id, title_color, title_position_h, title_position_v, position)
         VALUES ($1, $2, $3, $4, $5, $6, 0)`,
        [
          sectionId,
          content.title || null,
          content.title_font_id || null,
          content.title_color || '#ffffff',
          content.title_position_h || 'center',
          content.title_position_v || 'center'
        ]
      );
    }

    // 3. Gérer les liens de navigation (hero_nav_links)
    // Supprimer les anciens liens
    await query(`DELETE FROM hero_nav_links WHERE section_id = $1`, [sectionId]);
    
    // Insérer les nouveaux liens
    if (nav_sections && nav_sections.length > 0) {
      for (let i = 0; i < nav_sections.length; i++) {
        const targetId = nav_sections[i];
        const targetSection = await query(`SELECT title, type FROM sections WHERE id = $1`, [targetId]);
        const label = targetSection.rows[0]?.title || targetSection.rows[0]?.type || `Section ${targetId}`;
        
        await query(
          `INSERT INTO hero_nav_links (section_id, target_section_id, label, position, is_visible)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [sectionId, targetId, label, i]
        );
      }
    }

    res.json({ success: true, message: "Contenu hero mis à jour avec succès" });
  } catch (error) {
    logger.error("Erreur mise à jour hero content:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du contenu hero"
    });
  }
});

export default router;
