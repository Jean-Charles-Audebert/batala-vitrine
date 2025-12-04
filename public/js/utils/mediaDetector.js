/**
 * Media Detector - Utilitaires pour détecter les types de médias
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Détecte si un chemin de fichier est une vidéo
 * @param {string} filePath - Chemin du fichier
 * @returns {boolean}
 */
export function isVideoFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  const ext = filePath.toLowerCase();
  return VIDEO_EXTENSIONS.some(v => ext.endsWith(v));
}

/**
 * Détecte si un chemin de fichier est une image
 * @param {string} filePath - Chemin du fichier
 * @returns {boolean}
 */
export function isImageFile(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  const ext = filePath.toLowerCase();
  return IMAGE_EXTENSIONS.some(img => ext.endsWith(img));
}

/**
 * Détecte le type de média
 * @param {string} filePath - Chemin ou URL du fichier
 * @returns {string} - 'video', 'image', 'youtube', ou 'unknown'
 */
export function detectMediaType(filePath) {
  if (!filePath || typeof filePath !== 'string') return 'unknown';

  // Vérifier si c'est une URL YouTube
  if (filePath.includes('youtube.com') || filePath.includes('youtu.be')) {
    return 'youtube';
  }

  // Vérifier vidéo
  if (isVideoFile(filePath)) {
    return 'video';
  }

  // Vérifier image
  if (isImageFile(filePath)) {
    return 'image';
  }

  return 'unknown';
}

/**
 * Obtient l'extension du fichier
 * @param {string} filePath - Chemin du fichier
 * @returns {string} - Extension en minuscules (ex: '.mp4')
 */
export function getFileExtension(filePath) {
  if (!filePath) return '';
  const match = filePath.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
}

/**
 * Obtient le mime type pour un fichier vidéo
 * @param {string} filePath - Chemin du fichier
 * @returns {string} - MIME type ou 'video/mp4' par défaut
 */
export function getVideoMimeType(filePath) {
  const ext = getFileExtension(filePath);
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/avi',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/x-m4v'
  };
  return mimeTypes[ext] || 'video/mp4';
}
