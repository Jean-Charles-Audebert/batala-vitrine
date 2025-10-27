import { describe, it, expect } from '@jest/globals';
import { getSocialIcon } from '../../../src/utils/socialIcons.js';

describe('utils/socialIcons.getSocialIcon', () => {
  it('mappe les réseaux connus vers les classes Font Awesome', () => {
    expect(getSocialIcon('facebook')).toBe('fab fa-facebook');
    expect(getSocialIcon('instagram')).toBe('fab fa-instagram');
    expect(getSocialIcon('youtube')).toBe('fab fa-youtube');
    expect(getSocialIcon('tiktok')).toBe('fab fa-tiktok');
    expect(getSocialIcon('linkedin')).toBe('fab fa-linkedin');
  });

  it("gère l'alias x/twitter", () => {
    expect(getSocialIcon('x')).toBe('fab fa-x-twitter');
    expect(getSocialIcon('twitter')).toBe('fab fa-twitter');
  });

  it('retourne une icône générique pour un réseau inconnu', () => {
    expect(getSocialIcon('unknown-network')).toBe('fas fa-link');
  });
});
