/**
 * Utilitaires pour les templates EJS
 */

/**
 * Génère le chemin du fichier ORIGINAL depuis l'optimisé
 * Convention: optimisé = /uploads/photo.jpg (stocké en BDD), original = /uploads/photo-original.jpg
 * @param {string} optimizedPath - Chemin de l'image optimisée (ex: /uploads/photo.jpg)
 * @returns {string} - Chemin de l'image originale haute résolution (ex: /uploads/photo-original.jpg)
 */
export function getOriginalPath(optimizedPath) {
  if (!optimizedPath) return optimizedPath;
  
  const lastDot = optimizedPath.lastIndexOf('.');
  if (lastDot === -1) return optimizedPath;
  
  const basePath = optimizedPath.substring(0, lastDot);
  const ext = optimizedPath.substring(lastDot);
  
  return `${basePath}-original${ext}`;
}
