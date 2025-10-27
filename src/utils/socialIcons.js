// Helper pour les icônes sociales (Font Awesome)
export function getSocialIcon(network) {
  const icons = {
    facebook: 'fab fa-facebook',
    instagram: 'fab fa-instagram',
    youtube: 'fab fa-youtube',
    tiktok: 'fab fa-tiktok',
    x: 'fab fa-x-twitter',
    bluesky: 'fas fa-cloud',
    snapchat: 'fab fa-snapchat',
    linkedin: 'fab fa-linkedin',
    twitter: 'fab fa-twitter',
  };
  return icons[network] || 'fas fa-link';
}
