/**
 * Service d'optimisation d'images avec Sharp
 */
import sharp from "sharp";
import path from "path";
import { logger } from "./logger.js";
import { IMAGE_PRESETS } from "../constants.js";

/**
 * Optimise et redimensionne une image selon le preset
 * @param {string} inputPath - Chemin du fichier source
 * @param {string} outputPath - Chemin du fichier optimisé
 * @param {string} preset - Type de preset (logo, background, card, thumbnail)
 * @returns {Promise<Object>} - Infos sur l'image optimisée
 */
export async function optimizeImage(inputPath, outputPath, preset = "card") {
  try {
    const config = IMAGE_PRESETS[preset] || IMAGE_PRESETS.card;
    const ext = path.extname(outputPath).toLowerCase();

    logger.info(`[ImageOptimizer] Optimisation ${preset}: ${path.basename(inputPath)}`);

    // Configuration Sharp
    const sharpInstance = sharp(inputPath);
    
    // Récupérer les métadonnées
    const metadata = await sharpInstance.metadata();
    logger.info(`[ImageOptimizer] Image source: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Redimensionner
    sharpInstance.resize({
      width: config.width,
      height: config.height,
      fit: config.fit,
      background: config.background || { r: 255, g: 255, b: 255 },
      withoutEnlargement: false, // Permet d'agrandir les petites images
    });

    // Optimisation selon le format
    if (ext === ".jpg" || ext === ".jpeg") {
      sharpInstance.jpeg({ quality: 85, progressive: true });
    } else if (ext === ".png") {
      sharpInstance.png({ compressionLevel: 9, progressive: true });
    } else if (ext === ".webp") {
      sharpInstance.webp({ quality: 85 });
    }

    // Sauvegarder
    await sharpInstance.toFile(outputPath);

    const optimizedMetadata = await sharp(outputPath).metadata();
    logger.info(
      `[ImageOptimizer] Image optimisée: ${optimizedMetadata.width}x${optimizedMetadata.height}, ` +
      `taille: ${(optimizedMetadata.size / 1024).toFixed(2)} KB`
    );

    return {
      width: optimizedMetadata.width,
      height: optimizedMetadata.height,
      size: optimizedMetadata.size,
      format: optimizedMetadata.format,
    };
  } catch (error) {
    logger.error(`[ImageOptimizer] Erreur lors de l'optimisation`, error);
    throw error;
  }
}

/**
 * Détecte automatiquement le preset selon le nom du champ
 * @param {string} fieldName - Nom du champ (ex: "header_logo", "media_path", "bg_image")
 * @returns {string} - Nom du preset
 */
export function detectPresetFromField(fieldName) {
  if (fieldName.includes("logo")) {
    return "logo";
  } else if (fieldName.includes("bg") || fieldName.includes("background")) {
    return "background";
  } else if (fieldName.includes("media") || fieldName.includes("card")) {
    return "card";
  } else if (fieldName.includes("thumb")) {
    return "thumbnail";
  }
  
  // Par défaut
  return "card";
}

/**
 * Crée une version optimisée et retourne le nouveau chemin
 * @param {string} originalPath - Chemin du fichier original
 * @param {string} fieldName - Nom du champ pour détecter le preset
 * @returns {Promise<string>} - Chemin du fichier optimisé
 */
export async function createOptimizedVersion(originalPath, fieldName = "media_path") {
  const ext = path.extname(originalPath).toLowerCase();
  
  // Ne pas optimiser les GIF (pour préserver les animations) ni les SVG (format vectoriel)
  if (ext === ".gif" || ext === ".svg") {
    logger.info(`[ImageOptimizer] GIF ou SVG détecté, pas d'optimisation: ${path.basename(originalPath)}`);
    return originalPath;
  }
  
  const preset = detectPresetFromField(fieldName);
  const baseName = path.basename(originalPath, ext);
  const dir = path.dirname(originalPath);
  
  // Créer un fichier temporaire pour l'optimisation
  const tempPath = path.join(dir, `${baseName}-temp${ext}`);
  
  // Optimiser vers le fichier temporaire
  await optimizeImage(originalPath, tempPath, preset);
  
  // Supprimer l'original et renommer le fichier temporaire
  const fs = await import("fs/promises");
  await fs.unlink(originalPath);
  await fs.rename(tempPath, originalPath);
  
  return originalPath;
}
