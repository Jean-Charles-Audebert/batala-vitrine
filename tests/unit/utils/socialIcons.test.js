import { describe, it, expect } from '@jest/globals';
import { getSocialIcon } from '../../../src/utils/socialIcons.js';

describe('utils/socialIcons.getSocialIcon', () => {
  it('retourne une balise img avec le bon chemin SVG pour les réseaux connus', () => {
  expect(getSocialIcon('facebook')).toContain('/icons/facebook.svg');
    expect(getSocialIcon('facebook')).toContain('<img');
    expect(getSocialIcon('facebook')).toContain('class="social-icon"');
    
  expect(getSocialIcon('instagram')).toContain('/icons/instagram.svg');
  expect(getSocialIcon('youtube')).toContain('/icons/youtube.svg');
  expect(getSocialIcon('tiktok')).toContain('/icons/tiktok.svg');
  expect(getSocialIcon('linkedin')).toContain('/icons/linkedin.svg');
  });

  it("gère l'alias x/twitter", () => {
  expect(getSocialIcon('x')).toContain('/icons/twitter.svg');
  expect(getSocialIcon('twitter')).toContain('/icons/twitter.svg');
  });

  it('détecte le réseau social depuis une URL', () => {
  expect(getSocialIcon('https://facebook.com/batala')).toContain('/icons/facebook.svg');
  expect(getSocialIcon('https://instagram.com/batala')).toContain('/icons/instagram.svg');
  expect(getSocialIcon('https://youtube.com/c/batala')).toContain('/icons/youtube.svg');
  expect(getSocialIcon('https://x.com/batala')).toContain('/icons/twitter.svg');
  expect(getSocialIcon('https://twitter.com/batala')).toContain('/icons/twitter.svg');
  expect(getSocialIcon('https://bsky.app/profile/batala')).toContain('/icons/bluesky.svg');
  expect(getSocialIcon('https://linkedin.com/company/batala')).toContain('/icons/linkedin.svg');
  });

  it('retourne une icône par défaut pour un réseau inconnu', () => {
  expect(getSocialIcon('unknown-network')).toContain('/icons/twitter.svg');
  expect(getSocialIcon('https://unknown.com')).toContain('/icons/twitter.svg');
  });

  it('gère les nouveaux réseaux sociaux ajoutés', () => {
  expect(getSocialIcon('discord')).toContain('/icons/discord.svg');
  expect(getSocialIcon('slack')).toContain('/icons/slack.svg');
  expect(getSocialIcon('whatsapp')).toContain('/icons/whatsapp.svg');
  expect(getSocialIcon('reddit')).toContain('/icons/reddit.svg');
  });
});
