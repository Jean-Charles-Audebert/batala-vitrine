/**
 * Détecteur d'icône pour les réseaux sociaux
 * Basé sur l'URL et les domaines connus
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
 * Détecte le nom de la plateforme à partir de l'URL
 * @param {string} url - L'URL du réseau social
 * @returns {string} Le nom de la plateforme
 */
export function detectPlatformName(url = '') {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('facebook.com')) return 'Facebook';
  if (lowerUrl.includes('instagram.com')) return 'Instagram';
  if (lowerUrl.includes('twitter.com')) return 'Twitter';
  if (lowerUrl.includes('x.com')) return 'X';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'YouTube';
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('tiktok.com')) return 'TikTok';
  if (lowerUrl.includes('github.com')) return 'GitHub';
  if (lowerUrl.includes('gitlab.com')) return 'GitLab';
  if (lowerUrl.includes('pinterest.com')) return 'Pinterest';
  if (lowerUrl.includes('snapchat.com')) return 'Snapchat';
  if (lowerUrl.includes('telegram')) return 'Telegram';
  if (lowerUrl.includes('whatsapp')) return 'WhatsApp';
  if (lowerUrl.includes('discord')) return 'Discord';
  if (lowerUrl.includes('twitch')) return 'Twitch';
  if (lowerUrl.includes('reddit.com')) return 'Reddit';
  if (lowerUrl.includes('behance.net')) return 'Behance';
  if (lowerUrl.includes('dribbble.com')) return 'Dribbble';
  if (lowerUrl.includes('vimeo.com')) return 'Vimeo';
  if (lowerUrl.includes('medium.com')) return 'Medium';
  if (lowerUrl.includes('spotify.com')) return 'Spotify';
  if (lowerUrl.includes('soundcloud.com')) return 'SoundCloud';
  if (lowerUrl.includes('bsky.app') || lowerUrl.includes('bluesky.social')) return 'Bluesky';
  if (lowerUrl.includes('mastodon.social') || lowerUrl.includes('mastodon')) return 'Mastodon';
  if (lowerUrl.includes('threads.net')) return 'Threads';
  if (lowerUrl.includes('mailto:')) return 'Email';
  if (lowerUrl.includes('tel:')) return 'Téléphone';

  return 'Lien';
}

export default {
  detectSocialIcon,
  detectPlatformName
};
