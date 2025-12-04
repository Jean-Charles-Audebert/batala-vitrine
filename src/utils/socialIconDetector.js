/**
 * Détecteur d'icône pour les réseaux sociaux (côté serveur)
 * Version synchronisée avec le frontend
 */

const SOCIAL_ICON_MAP = {
  'facebook.com': 'fab fa-facebook',
  'instagram.com': 'fab fa-instagram',
  'twitter.com': 'fab fa-twitter',
  'x.com': 'fab fa-x-twitter',
  'youtube.com': 'fab fa-youtube',
  'youtu.be': 'fab fa-youtube',
  'linkedin.com': 'fab fa-linkedin',
  'tiktok.com': 'fab fa-tiktok',
  'github.com': 'fab fa-github',
  'gitlab.com': 'fab fa-gitlab',
  'pinterest.com': 'fab fa-pinterest',
  'snapchat.com': 'fab fa-snapchat',
  'telegram.org': 'fab fa-telegram',
  'telegram.me': 'fab fa-telegram',
  'whatsapp.com': 'fab fa-whatsapp',
  'discord.com': 'fab fa-discord',
  'twitch.tv': 'fab fa-twitch',
  'reddit.com': 'fab fa-reddit',
  'behance.net': 'fab fa-behance',
  'dribbble.com': 'fab fa-dribbble',
  'vimeo.com': 'fab fa-vimeo',
  'medium.com': 'fab fa-medium',
  'spotify.com': 'fab fa-spotify',
  'soundcloud.com': 'fab fa-soundcloud',
  'bsky.app': 'fab fa-bluesky',
  'bluesky.social': 'fab fa-bluesky',
  'mastodon.social': 'fab fa-mastodon',
  'threads.net': 'fab fa-threads',
  'email': 'fas fa-envelope',
  'phone': 'fas fa-phone',
  'website': 'fas fa-globe',
  'default': 'fas fa-link'
};

// Mapping des noms de plateforme vers les icônes (pour quand on a le platform name)
const PLATFORM_NAME_MAP = {
  'facebook': 'fab fa-facebook',
  'instagram': 'fab fa-instagram',
  'twitter': 'fab fa-twitter',
  'x': 'fab fa-x-twitter',
  'youtube': 'fab fa-youtube',
  'linkedin': 'fab fa-linkedin',
  'tiktok': 'fab fa-tiktok',
  'github': 'fab fa-github',
  'gitlab': 'fab fa-gitlab',
  'pinterest': 'fab fa-pinterest',
  'snapchat': 'fab fa-snapchat',
  'telegram': 'fab fa-telegram',
  'whatsapp': 'fab fa-whatsapp',
  'discord': 'fab fa-discord',
  'twitch': 'fab fa-twitch',
  'reddit': 'fab fa-reddit',
  'behance': 'fab fa-behance',
  'dribbble': 'fab fa-dribbble',
  'vimeo': 'fab fa-vimeo',
  'medium': 'fab fa-medium',
  'spotify': 'fab fa-spotify',
  'soundcloud': 'fab fa-soundcloud',
  'bluesky': 'fab fa-bluesky',
  'mastodon': 'fab fa-mastodon',
  'threads': 'fab fa-threads'
};

/**
 * Détecte l'icône FontAwesome pour une URL de réseau social
 * @param {string} url - L'URL ou le handle du réseau social
 * @param {string} platform - (optionnel) Le nom de la plateforme
 * @returns {string} La classe FontAwesome à utiliser
 */
export function detectSocialIcon(url = '', platform = '') {
  if (!url && !platform) return SOCIAL_ICON_MAP.default;

  const lowerUrl = url.toLowerCase();
  const lowerPlatform = platform.toLowerCase();

  // Chercher par platform d'abord dans la map des noms
  if (lowerPlatform && PLATFORM_NAME_MAP[lowerPlatform]) {
    return PLATFORM_NAME_MAP[lowerPlatform];
  }

  // Chercher par domaine dans l'URL
  for (const [domain, icon] of Object.entries(SOCIAL_ICON_MAP)) {
    if (lowerUrl.includes(domain)) {
      return icon;
    }
  }

  // Cas spéciaux
  if (lowerUrl.includes('mail:') || lowerUrl.includes('mailto:')) {
    return SOCIAL_ICON_MAP.email;
  }

  if (lowerUrl.startsWith('tel:')) {
    return SOCIAL_ICON_MAP.phone;
  }

  if (lowerUrl.startsWith('http')) {
    return SOCIAL_ICON_MAP.website;
  }

  return SOCIAL_ICON_MAP.default;
}

/**
 * Mappe les icônes FontAwesome pour un tableau de liens sociaux
 * @param {Array} links - Tableau de liens sociaux avec { url, platform, ... }
 * @returns {Array} Tableau avec icônes mappées { ..., icon: 'fab fa-...' }
 */
export function mapSocialLinkIcons(links = []) {
  return links.map(link => ({
    ...link,
    icon: detectSocialIcon(link.url, link.platform)
  }));
}

export default {
  detectSocialIcon,
  mapSocialLinkIcons
};
