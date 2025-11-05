// Liste des réseaux sociaux disponibles avec leurs icônes SVG
const SOCIAL_ICONS = {
  facebook: '/icons/facebook.svg',
  instagram: '/icons/instagram.svg',
  youtube: '/icons/youtube.svg',
  tiktok: '/icons/tiktok.svg',
  x: '/icons/twitter.svg', // fichier présent: twitter.svg
  twitter: '/icons/twitter.svg',
  bluesky: '/icons/bluesky.svg',
  linkedin: '/icons/linkedin.svg',
  discord: '/icons/discord.svg',
  slack: '/icons/slack.svg',
  whatsapp: '/icons/whatsapp.svg',
  reddit: '/icons/reddit.svg',
  github: '/icons/github.svg',
  gitlab: '/icons/gitlab.svg',
  mastodon: '/icons/mastodon.svg',
  threads: '/icons/threads.svg',
  telegram: '/icons/telegram.svg',
  pinterest: '/icons/pinterest.svg',
  snapchat: '/icons/snapchat.svg',
  teams: '/icons/teams.svg',
  skype: '/icons/skype.svg',
};

// Helper pour les icônes sociales (SVG)
export function getSocialIcon(network) {
  const icons = SOCIAL_ICONS;
  
  // Détecter le réseau social depuis l'URL si network est une URL
  let detectedNetwork = network?.toLowerCase();
  if (network?.includes('facebook.com')) detectedNetwork = 'facebook';
  else if (network?.includes('instagram.com')) detectedNetwork = 'instagram';
  else if (network?.includes('youtube.com')) detectedNetwork = 'youtube';
  else if (network?.includes('tiktok.com')) detectedNetwork = 'tiktok';
  else if (network?.includes('x.com') || network?.includes('twitter.com')) detectedNetwork = 'x';
  else if (network?.includes('bsky.app')) detectedNetwork = 'bluesky';
  else if (network?.includes('linkedin.com')) detectedNetwork = 'linkedin';
  else if (network?.includes('discord')) detectedNetwork = 'discord';
  else if (network?.includes('slack.com')) detectedNetwork = 'slack';
  else if (network?.includes('whatsapp.com')) detectedNetwork = 'whatsapp';
  else if (network?.includes('reddit.com')) detectedNetwork = 'reddit';
  
  const iconPath = icons[detectedNetwork] || '/icons/twitter.svg'; // fallback raisonnable
  return `<img src="${iconPath}" alt="${detectedNetwork}" class="social-icon" />`;
}

/**
 * Retourne la liste des réseaux sociaux disponibles
 * @returns {Array<{id: string, name: string, icon: string}>}
 */
export function getAvailableSocialNetworks() {
  return [
    { id: 'facebook', name: 'Facebook', icon: SOCIAL_ICONS.facebook },
    { id: 'instagram', name: 'Instagram', icon: SOCIAL_ICONS.instagram },
    { id: 'youtube', name: 'YouTube', icon: SOCIAL_ICONS.youtube },
    { id: 'tiktok', name: 'TikTok', icon: SOCIAL_ICONS.tiktok },
    { id: 'x', name: 'X (Twitter)', icon: SOCIAL_ICONS.x },
    { id: 'bluesky', name: 'Bluesky', icon: SOCIAL_ICONS.bluesky },
    { id: 'linkedin', name: 'LinkedIn', icon: SOCIAL_ICONS.linkedin },
    { id: 'discord', name: 'Discord', icon: SOCIAL_ICONS.discord },
    { id: 'slack', name: 'Slack', icon: SOCIAL_ICONS.slack },
    { id: 'whatsapp', name: 'WhatsApp', icon: SOCIAL_ICONS.whatsapp },
    { id: 'reddit', name: 'Reddit', icon: SOCIAL_ICONS.reddit },
    { id: 'github', name: 'GitHub', icon: SOCIAL_ICONS.github },
    { id: 'gitlab', name: 'GitLab', icon: SOCIAL_ICONS.gitlab },
    { id: 'mastodon', name: 'Mastodon', icon: SOCIAL_ICONS.mastodon },
    { id: 'threads', name: 'Threads', icon: SOCIAL_ICONS.threads },
    { id: 'telegram', name: 'Telegram', icon: SOCIAL_ICONS.telegram },
    { id: 'pinterest', name: 'Pinterest', icon: SOCIAL_ICONS.pinterest },
    { id: 'snapchat', name: 'Snapchat', icon: SOCIAL_ICONS.snapchat },
  ];
}
