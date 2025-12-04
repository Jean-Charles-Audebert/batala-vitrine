import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { upload, handleMulterError } from "../config/upload.js";
import { query } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { handleImageUpload, handleFaviconUpload } from "../controllers/uploadController.js";
import { buildPageData, buildEditorData } from "../services/pageBuilder.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// Définir __dirname pour ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fonction pour générer un mot de passe aléatoire sécurisé
function generateSecurePassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

// Fonction pour envoyer l'email avec le mot de passe
async function sendAdminPasswordEmail(email, password) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    logger.warn('Configuration SMTP manquante, impossible d\'envoyer l\'email');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const { rows } = await query('SELECT contact_email, title FROM page LIMIT 1');
  const contactEmail = rows[0]?.contact_email || smtpUser;
  const siteTitle = rows[0]?.title || 'Le site';

  const mailOptions = {
    from: `"${siteTitle} - Administration" <${contactEmail}>`,
    to: email,
    replyTo: contactEmail,
    subject: `Votre compte administrateur - ${siteTitle}`,
    text: `Bonjour,\n\nVotre compte administrateur a été créé pour le site "${siteTitle}".\n\nEmail: ${email}\nMot de passe: ${password}\n\nVous pouvez vous connecter à l'adresse: ${process.env.BASE_URL || 'http://localhost:3000'}/auth/login\n\nCordialement,\nL'équipe ${siteTitle}`,
    html: `
      <h2>Votre compte administrateur a été créé</h2>
      <p>Bonjour,</p>
      <p>Votre compte administrateur a été créé avec succès pour le site <strong>${siteTitle}</strong>.</p>
      <p><strong>Email :</strong> ${email}<br>
      <strong>Mot de passe :</strong> <code>${password}</code></p>
      <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}/auth/login" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Se connecter</a></p>
      <p style="margin-top: 2rem; color: #666; font-size: 0.9rem;">Cordialement,<br>L'équipe ${siteTitle}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error('Erreur envoi email admin:', error);
    return false;
  }
}

const router = express.Router();

// Note: La route /api/contact est définie directement dans server.js pour éviter les conflits d'authentification

// Route pour l'aperçu de la page publique (sans authentification pour éviter les conflits d'iframe)
router.get("/preview", async (req, res) => {
  try {
    logger.info('🖼️ Génération aperçu page publique...');

    // Construire les données complètes de la page (toutes les sections pour l'aperçu)
    const pageData = await buildEditorData();

    logger.info(`📊 Aperçu généré avec ${pageData.sections.length} sections et ${pageData.socialLinks.length} liens sociaux`);

    // Rendre la vue avec les données unifiées
    return res.render('pages/index-v2', {
      title: 'Aperçu',
      ...pageData,
      user: null, // Pas d'utilisateur pour l'aperçu
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
    const { title_font_id, bg_color, bg_image, bg_video } = req.body;

    // Récupérer les settings actuels
    const { rows } = await query('SELECT settings FROM page WHERE id = 1');
    const currentSettings = rows[0]?.settings || {};

    // Mettre à jour les settings
    const updatedSettings = {
      ...currentSettings,
      bg_color: bg_color || currentSettings.bg_color,
      bg_image: bg_image || currentSettings.bg_image,
      bg_video: bg_video || currentSettings.bg_video
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
  handleImageUpload
);

// Route API pour récupérer la liste des admins (JSON)
router.get("/admins", requireAuth, async (req, res) => {
  try {
    const { rows: admins } = await query(
      "SELECT id, email, is_active, is_super_admin, created_at FROM admins WHERE is_super_admin = FALSE ORDER BY created_at DESC"
    );
    res.json({ admins });
  } catch (error) {
    logger.error("Erreur récupération admins:", error);
    res.status(500).json({ error: "Erreur lors du chargement des admins" });
  }
});

// Route API pour créer un admin
router.post("/admins", requireAuth, async (req, res) => {
  try {
    const { email, is_active } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Vérifier si l'email existe déjà
    const { rows: existing } = await query('SELECT id FROM admins WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Générer un mot de passe aléatoire sécurisé
    const generatedPassword = generateSecurePassword();
    
    const { hashPassword } = await import('../utils/password.js');
    const passwordHash = await hashPassword(generatedPassword);
    
    // Convertir is_active en booléen (par défaut true si non spécifié)
    const isActiveValue = is_active !== false && is_active !== 'false';
    
    logger.info(`Création admin: email=${email}, is_active reçu=${is_active}, is_active final=${isActiveValue}`);
    
    await query(
      "INSERT INTO admins (email, password_hash, is_active, created_by) VALUES ($1, $2, $3, $4)",
      [email, passwordHash, isActiveValue, req.user?.sub || 1]
    );

    // Envoyer l'email avec le mot de passe
    const emailSent = await sendAdminPasswordEmail(email, generatedPassword);
    
    if (emailSent) {
      logger.info(`Admin créé: ${email}, email envoyé avec succès`);
      res.json({ success: true, message: `Admin créé avec succès. Un email a été envoyé à ${email} avec le mot de passe.` });
    } else {
      logger.warn(`Admin créé: ${email}, mais email non envoyé (config SMTP manquante)`);
      res.json({ success: true, message: `Admin créé avec succès. Mot de passe temporaire: ${generatedPassword}`, password: generatedPassword });
    }
  } catch (error) {
    logger.error('Erreur création admin:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'admin' });
  }
});

// Route API pour mettre à jour un admin (seulement activer/désactiver)
router.put("/admins/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await query(
      "UPDATE admins SET is_active=$1 WHERE id=$2 AND is_super_admin=FALSE",
      [is_active === true || is_active === 'on', id]
    );

    res.json({ success: true, message: is_active ? 'Admin activé' : 'Admin désactivé' });
  } catch (error) {
    logger.error('Erreur modification admin:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'admin' });
  }
});

// Route API pour supprimer un admin
router.delete("/admins/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM admins WHERE id=$1", [id]);
    res.json({ success: true, message: 'Admin supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur suppression admin:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'admin' });
  }
});

// Route API pour l'upload du favicon
router.post(
  "/upload/favicon",
  requireAuth,
  upload.single("favicon"),
  handleMulterError,
  handleFaviconUpload
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

    // Note: Les liens de navigation sont maintenant gérés via des éléments de type 'link'
    // dans la table elements, plus besoin de hero_nav_links

    res.json({ success: true, message: "Contenu hero mis à jour avec succès" });
  } catch (error) {
    logger.error("Erreur mise à jour hero content:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du contenu hero"
    });
  }
});

// === ROUTES POUR LA GESTION DES POLICES ===
router.get('/fonts', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM fonts ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    logger.error('Erreur récupération polices:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des polices' });
  }
});

router.post('/fonts', requireAuth, async (req, res) => {
  const { name, source, font_family, url, variants } = req.body;

  try {
    const { rows } = await query(`
      INSERT INTO fonts (name, source, font_family, url, variants)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, source, font_family, url, JSON.stringify(variants || [])]);

    res.json(rows[0]);
  } catch (error) {
    logger.error('Erreur création police:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la police' });
  }
});

router.post('/fonts/upload', requireAuth, upload.single('file'), async (req, res) => {
  const { name, font_family, source } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Aucun fichier fourni' });
  }

  try {
    // Le fichier est déjà uploadé dans public/uploads/, créer le chemin relatif
    const filePath = `/uploads/${file.filename}`;

    const { rows } = await query(`
      INSERT INTO fonts (name, source, font_family, url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, source, font_family, filePath]);

    res.json(rows[0]);
  } catch (error) {
    logger.error('Erreur upload police:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la police' });
  }
});

router.delete('/fonts/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier que la police n'est pas utilisée
    const { rows: usageCheck } = await query(`
      SELECT COUNT(*) as count FROM page WHERE default_font_title = $1 OR default_font_text = $1
    `, [id]);

    if (usageCheck[0].count > 0) {
      return res.status(400).json({ error: 'Cette police est utilisée et ne peut pas être supprimée' });
    }

    await query('DELETE FROM fonts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    logger.error('Erreur suppression police:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la police' });
  }
});

export default router;
