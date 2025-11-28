import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
} from '../../../src/controllers/sectionController.js';
import { query } from '../../../src/config/db.js';

/**
 * Tests d'intégration pour sectionController
 * Ces tests utilisent la vraie DB pour valider le comportement complet
 */

describe('sectionController - tests d\'intégration', () => {
  let testPageId;

  beforeAll(async () => {
    // Créer une page de test
    const { rows } = await query(`
      INSERT INTO page (title, contact_email, settings)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['Test Page', 'test@example.com', JSON.stringify({})]);
    testPageId = rows[0].id;
  });

  describe('getAllSections', () => {
    it('doit retourner un tableau de sections', async () => {
      const sections = await getAllSections();
      
      expect(Array.isArray(sections)).toBe(true);
      
      // Si des sections existent, vérifier la structure
      if (sections.length > 0) {
        const firstSection = sections[0];
        expect(firstSection).toHaveProperty('id');
        expect(firstSection).toHaveProperty('type');
        expect(firstSection).toHaveProperty('position');
        expect(firstSection).toHaveProperty('elements');
        expect(Array.isArray(firstSection.elements)).toBe(true);
      }
    });

    it('les sections sont triées par position', async () => {
      const sections = await getAllSections();
      
      if (sections.length > 1) {
        for (let i = 0; i < sections.length - 1; i++) {
          const currentPos = sections[i].position ?? 9999;
          const nextPos = sections[i + 1].position ?? 9999;
          expect(currentPos).toBeLessThanOrEqual(nextPos);
        }
      }
    });
  });

  describe('getSectionById', () => {
    it('doit retourner une section existante avec toutes ses relations', async () => {
      const sections = await getAllSections();
      
      if (sections.length > 0) {
        const sectionId = sections[0].id;
        const section = await getSectionById(sectionId);
        
        expect(section).toBeTruthy();
        expect(section.id).toBe(sectionId);
        expect(section).toHaveProperty('type');
        expect(section).toHaveProperty('elements');
        expect(Array.isArray(section.elements)).toBe(true);
        
        // Vérifier les éléments selon le type
        if (section.type === 'card_grid') {
          expect(section).toHaveProperty('elements');
          expect(Array.isArray(section.elements)).toBe(true);
        }
      }
    });

    it('doit retourner null pour un ID inexistant', async () => {
      const section = await getSectionById(99999);
      expect(section).toBeNull();
    });
  });

  describe('createSection', () => {
    let createdSectionId;

    it('doit créer une nouvelle section avec des données valides', async () => {
      const sectionData = {
        type: 'standard',
        page_id: testPageId,
        title: 'Test Section',
        layout: null,
        settings: { bg_color: '#ffffff' }
      };

      const section = await createSection(sectionData);
      createdSectionId = section.id;

      expect(section).toBeTruthy();
      expect(section.id).toBeDefined();
      expect(section.type).toBe('standard');
      expect(section.settings.bg_color).toBe('#ffffff');
    });

    afterAll(async () => {
      // Nettoyer la section créée
      if (createdSectionId) {
        await deleteSection(createdSectionId);
      }
    });
  });

  describe('updateSection', () => {
    let testSectionId;

    beforeAll(async () => {
      // Créer une section pour les tests
      const section = await createSection({
        type: 'standard',
        page_id: testPageId,
        settings: { bg_color: '#ffffff' }
      });
      testSectionId = section.id;
    });

    it('doit mettre à jour une section existante', async () => {
      const updates = {
        type: 'hero',
        settings: { bg_color: '#000000' }
      };

      const section = await updateSection(testSectionId, updates);

      expect(section).toBeTruthy();
      expect(section.type).toBe('hero');
      expect(section.settings.bg_color).toBe('#000000');
    });

    it('doit retourner null pour un ID inexistant', async () => {
      const section = await updateSection(99999, { type: 'standard' });
      expect(section).toBeNull();
    });

    afterAll(async () => {
      // Nettoyer
      if (testSectionId) {
        await deleteSection(testSectionId);
      }
    });
  });

  describe('deleteSection', () => {
    it('doit supprimer une section existante', async () => {
      // Créer une section à supprimer
      const section = await createSection({
        type: 'standard',
        page_id: testPageId,
        settings: { bg_color: '#ffffff' }
      });

      const result = await deleteSection(section.id);
      expect(result).toBe(true);

      // Vérifier qu'elle n'existe plus
      const deletedSection = await getSectionById(section.id);
      expect(deletedSection).toBeNull();
    });

    it('doit retourner false pour un ID inexistant', async () => {
      const result = await deleteSection(99999);
      expect(result).toBe(false);
    });
  });
});
