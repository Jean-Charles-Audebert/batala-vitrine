// Helper pour les icônes sociales (SVG)
export function getSocialIcon(network) {
  // Liste des réseaux sociaux disponibles avec leurs icônes SVG
  const icons = {
    facebook: '/images/facebook.svg',
    instagram: '/images/instagram.svg',
    youtube: '/images/youtube.svg',
    tiktok: '/images/tiktok.svg',
    x: '/images/x.svg',
    twitter: '/images/x.svg', // alias pour x
    bluesky: '/images/bluesky.svg',
    linkedin: '/images/linkedin.svg',
    discord: '/images/discord.svg',
    slack: '/images/slack.svg',
    whatsapp: '/images/whatsapp.svg',
    reddit: '/images/reddit.svg',
  };
  
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
  
  const iconPath = icons[detectedNetwork] || '/images/x.svg'; // fallback vers x
  return `<img src="${iconPath}" alt="${detectedNetwork}" class="social-icon" />`;
}
