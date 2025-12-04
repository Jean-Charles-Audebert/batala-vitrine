/**
 * Media Helper - Utilitaires pour les vues EJS
 * À utiliser côté serveur pour le rendu HTML
 */

/* global URL */

/**
 * Extrait l'ID vidéo YouTube depuis une URL
 * @param {string} url - URL YouTube
 * @returns {string|null}
 */
export function extractYouTubeIdServer(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0].split('&')[0];
    } else if (url.includes('youtube.com/watch')) {
      // eslint-disable-next-line no-undef
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0].split('&')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      return url.split('shorts/')[1].split('?')[0].split('&')[0];
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Détecte si un chemin est une vidéo locale
 * @param {string} filePath
 * @returns {boolean}
 */
export function isVideoFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false;
  return /\.(mp4|webm|avi|mov|mkv|flv|wmv|m4v)$/i.test(filePath);
}
