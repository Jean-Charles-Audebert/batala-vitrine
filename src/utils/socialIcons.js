// Helper pour les icônes sociales (SVG)
export function getSocialIcon(network) {
  // Liste des réseaux sociaux disponibles avec leurs icônes SVG
  const icons = {
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
  
  const iconPath = icons[detectedNetwork] || '/icons/twitter.svg'; // fallback raisonnable
  return `<img src="${iconPath}" alt="${detectedNetwork}" class="social-icon" />`;
}
