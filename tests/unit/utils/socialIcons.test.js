import { describe, it, expect } from '@jest/globals';
import { getSocialIcon } from '../../../src/utils/socialIcons.js';

describe('utils/socialIcons.getSocialIcon', () => {
  it('retourne une balise img avec le bon chemin SVG pour les réseaux connus', () => {
    expect(getSocialIcon('facebook')).toContain('/images/facebook.svg');
    expect(getSocialIcon('facebook')).toContain('<img');
    expect(getSocialIcon('facebook')).toContain('class="social-icon"');
    
    expect(getSocialIcon('instagram')).toContain('/images/instagram.svg');
    expect(getSocialIcon('youtube')).toContain('/images/youtube.svg');
    expect(getSocialIcon('tiktok')).toContain('/images/tiktok.svg');
    expect(getSocialIcon('linkedin')).toContain('/images/linkedin.svg');
  });

  it("gère l'alias x/twitter", () => {
    expect(getSocialIcon('x')).toContain('/images/x.svg');
    expect(getSocialIcon('twitter')).toContain('/images/x.svg');
  });

  it('détecte le réseau social depuis une URL', () => {
    expect(getSocialIcon('https://facebook.com/batala')).toContain('/images/facebook.svg');
    expect(getSocialIcon('https://instagram.com/batala')).toContain('/images/instagram.svg');
    expect(getSocialIcon('https://youtube.com/c/batala')).toContain('/images/youtube.svg');
    expect(getSocialIcon('https://x.com/batala')).toContain('/images/x.svg');
    expect(getSocialIcon('https://twitter.com/batala')).toContain('/images/x.svg');
    expect(getSocialIcon('https://bsky.app/profile/batala')).toContain('/images/bluesky.svg');
    expect(getSocialIcon('https://linkedin.com/company/batala')).toContain('/images/linkedin.svg');
  });

  it('retourne une icône par défaut pour un réseau inconnu', () => {
    expect(getSocialIcon('unknown-network')).toContain('/images/x.svg');
    expect(getSocialIcon('https://unknown.com')).toContain('/images/x.svg');
  });

  it('gère les nouveaux réseaux sociaux ajoutés', () => {
    expect(getSocialIcon('discord')).toContain('/images/discord.svg');
    expect(getSocialIcon('slack')).toContain('/images/slack.svg');
    expect(getSocialIcon('whatsapp')).toContain('/images/whatsapp.svg');
    expect(getSocialIcon('reddit')).toContain('/images/reddit.svg');
  });
});
