import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getAllDecorations
} from '../../../src/controllers/sectionController.js';

/**
 * Tests d'intégration pour sectionController
 * Ces tests utilisent la vraie DB pour valider le comportement complet
 */

describe('sectionController - tests d\'intégration', () => {

  describe('getAllSections', () => {
    it('doit retourner un tableau de sections', async () => {
      const sections = await getAllSections();
      
      expect(Array.isArray(sections)).toBe(true);
      
      // Si des sections existent, vérifier la structure
      if (sections.length > 0) {
        const firstSection = sections[0];
        expect(firstSection).toHaveProperty('id');
        expect(firstSection).toHaveProperty('type');
        expect(firstSection).toHaveProperty('title');
        expect(firstSection).toHaveProperty('position');
        expect(firstSection).toHaveProperty('content');
        expect(Array.isArray(firstSection.content)).toBe(true);
        expect(firstSection).toHaveProperty('decorations');
        expect(Array.isArray(firstSection.decorations)).toBe(true);
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
        expect(section).toHaveProperty('content');
        expect(Array.isArray(section.content)).toBe(true);
        expect(section).toHaveProperty('decorations');
        expect(Array.isArray(section.decorations)).toBe(true);
        
        // Vérifier les cartes selon le type
        if (section.type === 'card_grid') {
          expect(section).toHaveProperty('cards');
          expect(Array.isArray(section.cards)).toBe(true);
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
        type: 'content',
        title: 'Test Section',
        bg_color: '#ffffff',
        layout: 'centered',
        position: 999
      };

      const section = await createSection(sectionData);
      createdSectionId = section.id;

      expect(section).toBeTruthy();
      expect(section.id).toBeDefined();
      expect(section.type).toBe('content');
      expect(section.title).toBe('Test Section');
      expect(section.bg_color).toBe('#ffffff');
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
        type: 'content',
        title: 'Section à modifier',
        position: 998
      });
      testSectionId = section.id;
    });

    it('doit mettre à jour une section existante', async () => {
      const updates = {
        title: 'Titre modifié',
        bg_color: '#000000'
      };

      const section = await updateSection(testSectionId, updates);

      expect(section).toBeTruthy();
      expect(section.title).toBe('Titre modifié');
      expect(section.bg_color).toBe('#000000');
    });

    it('doit retourner null pour un ID inexistant', async () => {
      const section = await updateSection(99999, { title: 'Test' });
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
        type: 'content',
        title: 'Section à supprimer',
        position: 997
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

  describe('getAllDecorations', () => {
    it('doit retourner toutes les décorations disponibles', async () => {
      const decorations = await getAllDecorations();

      expect(Array.isArray(decorations)).toBe(true);
      expect(decorations.length).toBeGreaterThan(0);

      if (decorations.length > 0) {
        const firstDecoration = decorations[0];
        expect(firstDecoration).toHaveProperty('id');
        expect(firstDecoration).toHaveProperty('display_name');
        expect(firstDecoration).toHaveProperty('name');
        expect(firstDecoration).toHaveProperty('type');
        expect(firstDecoration).toHaveProperty('svg_code');
        expect(firstDecoration).toHaveProperty('default_color');
        expect(firstDecoration).toHaveProperty('supported_positions');
      }
    });

    it('les décorations contiennent du code SVG valide', async () => {
      const decorations = await getAllDecorations();

      decorations.forEach(decoration => {
        expect(decoration.svg_code).toContain('<svg');
        expect(decoration.svg_code).toContain('</svg>');
      });
    });
  });
});
