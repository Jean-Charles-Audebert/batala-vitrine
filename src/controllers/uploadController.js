/**
 * Upload Controller
 * Gestion centralisée des uploads (images, favicon, fonts)
 */

import { createOptimizedVersion } from '../utils/imageOptimizer.js';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Upload et optimisation d'image
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export async function handleImageUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier fourni.",
      });
    }

    const fieldName = req.body.fieldName || "media_path";
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

/**
 * Upload et optimisation du favicon
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export async function handleFaviconUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier fourni.",
      });
    }

    const fs = await import('fs/promises');
    
    const uploadedFilePath = path.join(__dirname, "../../public/uploads", req.file.filename);
    const faviconPath = path.join(__dirname, "../../public/icons/favicon.ico");

    logger.info(`Favicon uploadé : ${req.file.filename} (${req.file.size} bytes)`);

    // Optimiser le favicon avec preset "favicon"
    let optimizedPath;
    try {
      optimizedPath = await createOptimizedVersion(uploadedFilePath, "favicon");
      logger.info(`Favicon optimisé créé: ${path.basename(optimizedPath)}`);
    } catch (optError) {
      logger.error("Erreur optimisation favicon (fichier conservé non optimisé):", optError);
      optimizedPath = uploadedFilePath;
    }

    // Copier le fichier optimisé vers favicon.ico
    await fs.copyFile(optimizedPath, faviconPath);
    logger.info(`Favicon sauvegardé: ${faviconPath}`);
    
    // Nettoyer les fichiers temporaires
    try {
      await fs.unlink(uploadedFilePath);
      if (optimizedPath !== uploadedFilePath) {
        await fs.unlink(optimizedPath);
      }
    } catch (cleanupError) {
      logger.warn("Erreur nettoyage fichiers temporaires favicon:", cleanupError);
      // Ne pas bloquer la réponse si le nettoyage échoue
    }

    res.json({
      success: true,
      message: "Favicon mis à jour avec succès",
      url: "/icons/favicon.ico"
    });
  } catch (error) {
    logger.error("Erreur upload favicon:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload du favicon.",
    });
  }
}

export default {
  handleImageUpload,
  handleFaviconUpload
};
