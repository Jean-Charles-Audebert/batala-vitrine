/**
 * YouTube Helper - Utilitaires pour extraire et valider des URLs YouTube
 */

/* global URL */

/**
 * Extrait l'ID vidéo YouTube depuis diverses URL formats
 * @param {string} url - URL YouTube (formats supportés: youtu.be/, youtube.com/watch, youtube.com/embed/, youtube.com/shorts/)
 * @returns {string|null} - L'ID vidéo ou null si invalide
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;

  let videoId = '';
  try {
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
    } else if (url.includes('youtube.com/watch')) {
      try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      } catch {
        // Fallback pour contextes sans URL natif
        const match = url.match(/[?&]v=([^&]+)/);
        videoId = match ? match[1] : '';
      }
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0].split('&')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1].split('?')[0].split('&')[0];
    }
  } catch (e) {
    console.error('[youtubeHelper] Erreur extraction ID YouTube:', e);
    return null;
  }

  return videoId || null;
}

/**
 * Valide si une URL est une URL YouTube valide
 * @param {string} url - URL à valider
 * @returns {boolean}
 */
export function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return extractYouTubeId(url) !== null;
}

/**
 * Convertit une URL YouTube en URL d'embed
 * @param {string} url - URL YouTube
 * @returns {string|null} - URL d'embed ou null
 */
export function convertToEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Crée une URL d'embed YouTube avec paramètres pour lecteur
 * @param {string} url - URL YouTube
 * @param {Object} options - Options (autoplay, mute, loop, etc.)
 * @returns {string|null}
 */
export function createPlayerUrl(url, options = {}) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  const defaultParams = {
    autoplay: 1,
    mute: 1,
    loop: 1,
    playlist: videoId,
    controls: 0,
    rel: 0,
    modestbranding: 1,
    playsinline: 1
  };

  const params = { ...defaultParams, ...options };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `https://www.youtube.com/embed/${videoId}?${queryString}`;
}
