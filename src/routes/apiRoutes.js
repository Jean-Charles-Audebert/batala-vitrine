import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { upload, handleMulterError } from "../config/upload.js";
import { logger } from "../utils/logger.js";
import { createOptimizedVersion } from "../utils/imageOptimizer.js";
import { query } from "../config/db.js";
import { buildPageData } from "../services/pageBuilder.js";
import { getSocialIcon } from "../utils/socialIcons.js";

const router = express.Router();

// Note: La route /api/contact est définie directement dans server.js pour éviter les conflits d'authentification

// Route pour l'aperçu de la page publique (sans authentification pour éviter les conflits d'iframe)
router.get("/preview", async (req, res) => {
  try {
    logger.info('🖼️ Génération aperçu page publique...');

    // Construire les données complètes de la page
    const pageData = await buildPageData();

    // Charger les liens sociaux (si la table existe)
    let socialLinks = [];
    try {
      const result = await query(`
        SELECT * FROM social_links
        WHERE is_visible = true
        ORDER BY position ASC
      `);
      socialLinks = result.rows;
    } catch (socialError) {
      // La table social_links n'existe pas encore, c'est OK
      logger.info('ℹ️ Table social_links non trouvée, utilisation d\'une liste vide');
    }

    logger.info(`📊 Aperçu généré avec ${pageData.sections.length} sections`);

    // Rendre la vue avec les données unifiées
    return res.render('pages/index-v2', {
      title: 'Aperçu',
      ...pageData,
      socialLinks,
      user: null, // Pas d'utilisateur pour l'aperçu
      getSocialIcon
    });

  } catch (error) {
    logger.error('Erreur génération aperçu:', error);

    // En cas d'erreur, rendre avec des données minimales
    return res.render('pages/index-v2', {
      title: 'Aperçu',
      page: {},
      sections: [],
      fonts: [],
      socialLinks: [],
      user: null,
      getSocialIcon
    });
  }
});

// Routes pour l'éditeur JSON - SUPPRIMÉ (utilise uniquement la BDD)
router.get("/site-config", requireAuth, async (req, res) => {
  res.status(410).json({ error: "Endpoint supprimé - utiliser uniquement la BDD" });
});

router.post("/site-config", requireAuth, async (req, res) => {
  res.status(410).json({ error: "Endpoint supprimé - utiliser uniquement la BDD" });
});

router.get("/schemas", requireAuth, async (req, res) => {
  res.status(410).json({ error: "Endpoint supprimé - utiliser uniquement la BDD" });
});

// Route API pour le réordonnancement des blocs - SUPPRIMÉ (système legacy)
// router.post("/blocks/reorder", requireAuth, reorderBlocks);

// ===============================
// Thème global (page) : GET et PUT
// ===============================
router.get("/page", requireAuth, async (req, res) => {
  try {
    const pageData = await buildPageData();
    res.json(pageData);
  } catch (error) {
    logger.error("Erreur chargement page settings:", error);
    res.status(500).json({ error: "Erreur chargement page settings" });
  }
});

router.put("/page/theme", requireAuth, async (req, res) => {
  try {
    const { title_font_id, main_bg_color, main_bg_image, main_bg_video } = req.body;

    // Récupérer les settings actuels
    const { rows } = await query('SELECT settings FROM page WHERE id = 1');
    const currentSettings = rows[0]?.settings || {};

    // Mettre à jour les settings
    const updatedSettings = {
      ...currentSettings,
      bg_color: main_bg_color || currentSettings.bg_color,
      bg_image: main_bg_image || currentSettings.bg_image,
      bg_video: main_bg_video || currentSettings.bg_video
    };

    await query(
      `UPDATE page SET settings = $1, updated_at = NOW() WHERE id = 1`,
      [JSON.stringify(updatedSettings)]
    );
    res.json({ success: true, message: "Thème global mis à jour" });
  } catch (error) {
    logger.error("Erreur mise à jour thème global:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du thème global" });
  }
});

// Route PUT pour mettre à jour une page complète
router.put("/pages/:id", requireAuth, async (req, res) => {
  try {
    const pageId = parseInt(req.params.id);
    const {
      title,
      contact_email,
      default_font_title,
      default_font_text,
      settings
    } = req.body;

    await query(
      `UPDATE page SET
        title = $1,
        contact_email = $2,
        default_font_title = $3,
        default_font_text = $4,
        settings = $5,
        updated_at = NOW()
       WHERE id = $6`,
      [
        title || null,
        contact_email || null,
        default_font_title || null,
        default_font_text || null,
        JSON.stringify(settings || {}),
        pageId
      ]
    );

    res.json({ success: true, message: "Page mise à jour avec succès" });
  } catch (error) {
    logger.error("Erreur mise à jour page:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la page" });
  }
});

// Route API pour le réordonnancement des cartes - SUPPRIMÉ (système legacy)
// router.post("/blocks/:blockId/cards/reorder", requireAuth, reorderCards);

// Routes API pour CRUD cartes (édition rapide) - SUPPRIMÉ (système legacy)
// router.get("/blocks/:blockId/cards/:id", requireAuth, getCardJson);
// router.post("/blocks/:blockId/cards/:id", requireAuth, updateCardJson);
// router.post("/blocks/:blockId/cards", requireAuth, createCardJson);

// Routes API pour CRUD footer elements (édition inline) - SUPPRIMÉ (système legacy)
// router.get("/blocks/:blockId/footer-elements/:type", requireAuth, getFooterElementJson);
// router.get("/blocks/:blockId/footer-elements/list/:type", requireAuth, listFooterElementsJson);
// router.post("/blocks/:blockId/footer-elements/:type", requireAuth, upsertFooterElementJson);
// router.delete("/blocks/:blockId/footer-elements/:id", requireAuth, deleteFooterElementJson);

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

// Route pour charger le HTML des polices dans l'editor
router.get("/admin/fonts", requireAuth, async (req, res) => {
  try {
    const { rows: fonts } = await query('SELECT * FROM fonts ORDER BY source, name', []);
    
    let html = '';
    if (fonts && fonts.length > 0) {
      fonts.forEach(font => {
        html += `
        <div class="font-item" data-font-id="${font.id}">
          <div class="font-info">
            <span class="font-name" style="font-family: '${font.font_family || 'inherit'}';">${font.name}</span>
            <span class="font-source">${font.source === 'google' ? 'Google Fonts' : 'Uploadée'}</span>
          </div>
          <div class="font-actions">
            <button class="btn btn-sm btn-danger" data-action="delete-font" data-font-id="${font.id}">
              <img src="/icons/trash.svg" alt="" class="icon">
            </button>
          </div>
        </div>`;
      });
    } else {
      html = '<p class="empty-state">Aucune police trouvée</p>';
    }
    
    res.send(html);
  } catch (error) {
    logger.error("Erreur chargement HTML polices:", error);
    res.status(500).send('<p class="error">Erreur lors du chargement des polices</p>');
  }
});

// Route pour supprimer une police
router.delete("/fonts/:id", requireAuth, async (req, res) => {
  try {
    const fontId = parseInt(req.params.id);
    
    // Récupérer les infos de la police avant suppression
    const { rows: fonts } = await query('SELECT * FROM fonts WHERE id = $1', [fontId]);
    if (fonts.length === 0) {
      return res.status(404).json({ error: 'Police non trouvée' });
    }
    
    const font = fonts[0];
    
    // Supprimer de la base de données
    await query('DELETE FROM fonts WHERE id = $1', [fontId]);
    
    // Supprimer le fichier physique si c'est une police uploadée
    if (font.file_path && font.source === 'upload') {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const fullPath = path.join(process.cwd(), 'public', font.file_path);
        await fs.unlink(fullPath);
        logger.info(`Fichier police supprimé: ${fullPath}`);
      } catch (fileError) {
        logger.warn(`Impossible de supprimer le fichier police: ${fileError.message}`);
      }
    }
    
    res.json({ success: true, message: 'Police supprimée avec succès' });
  } catch (error) {
    logger.error("Erreur suppression police:", error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la police' });
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

    // 2. Mettre à jour les éléments de contenu (titre, description, CTA)
    // Supprimer les anciens éléments de contenu
    await query('DELETE FROM elements WHERE section_id = $1 AND type IN ($2, $3, $4)', 
      [sectionId, 'text', 'link-navigation', 'link-social']);

    // Créer les nouveaux éléments basés sur le contenu fourni
    const elements = [];
    let position = 0;

    if (content.title) {
      elements.push({
        type: 'text',
        title: 'Titre principal',
        position: position++,
        settings: {
          content: content.title,
          font_id: content.title_font_id,
          color: content.title_color || '#ffffff'
        }
      });
    }

    if (content.subtitle) {
      elements.push({
        type: 'text',
        title: 'Sous-titre',
        position: position++,
        settings: {
          content: content.subtitle,
          font_id: content.subtitle_font_id,
          color: content.subtitle_color || '#ffffff'
        }
      });
    }

    if (content.description) {
      elements.push({
        type: 'text',
        title: 'Description',
        position: position++,
        settings: {
          content: content.description,
          font_id: content.description_font_id,
          color: content.description_color || '#ffffff'
        }
      });
    }

    if (content.cta_label && content.cta_url) {
      elements.push({
        type: 'link-navigation',
        title: 'CTA principal',
        position: position++,
        settings: {
          label: content.cta_label,
          url: content.cta_url
        }
      });
    }

    // Insérer les nouveaux éléments
    for (const element of elements) {
      await query(`
        INSERT INTO elements (section_id, type, title, position, settings)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        sectionId,
        element.type,
        element.title,
        element.position,
        JSON.stringify(element.settings)
      ]);
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
