/**
 * Script de seed pour initialiser la base avec des données conformes au modèle JSON
 */

import { query } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('🌱 Début du seeding de la base de données...');

    // 1. Créer des polices par défaut
    await query(`
      INSERT INTO fonts (name, source, font_family, url)
      VALUES
        ('Titre par défaut', 'system', 'Arial', null),
        ('Texte par défaut', 'system', 'Arial', null)
      ON CONFLICT (name) DO NOTHING
    `);

    logger.info('🔤 Polices par défaut créées');

    // 2. Créer ou mettre à jour la page principale
    const { rows: pageRows } = await query(`
      INSERT INTO page (title, default_font_title, default_font_text, contact_email, settings)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        default_font_title = EXCLUDED.default_font_title,
        default_font_text = EXCLUDED.default_font_text,
        contact_email = EXCLUDED.contact_email,
        settings = EXCLUDED.settings
      RETURNING id
    `, [
      'Site Démo',
      1, // default_font_title
      2, // default_font_text
      'contact@example.com',
      JSON.stringify({
        bg_color: '#ffffff',
        bg_image: null,
        bg_video: null,
        bg_video_youtube: null,
        bg_transparent: false
      })
    ]);

    const pageId = pageRows[0].id;
    logger.info(`📄 Page principale créée (ID: ${pageId})`);

    // 2. Créer les sections selon le modèle JSON
    const sections = [
      {
        type: 'hero',
        position: 0,
        is_visible: true,
        settings: {
          bg_color: '#f0f0f0',
          bg_transparent: false,
          bg_image: '/assets/header-bg-default.svg',
          bg_video: null,
          bg_video_youtube: null,
          title: 'Bienvenue',
          title_color: '#000000',
          title_font: null,
          title_size: 48,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'media',
            col_start: 1,
            col_end: 3,
            settings: {
              media_url: '/assets/logo-default.svg',
              width: 'auto',
              height: '80px',
              align: 'left',
              vertical_align: 'center',
            },
          },
          {
            type: 'text',
            col_start: 3,
            col_end: 10,
            settings: {
              content: 'Bienvenue sur notre site',
              size: '48px',
              color: '#000000',
              align: 'center',
              vertical_align: 'center',
            },
          },
          {
            type: 'media',
            col_start: 10,
            col_end: 12,
            settings: {
              social_icons: [
                { type: 'facebook', url: 'https://facebook.com' },
                { type: 'instagram', url: 'https://instagram.com' },
                { type: 'youtube', url: 'https://youtube.com' },
              ],
              align: 'right',
              vertical_align: 'center',
            },
          },
        ],
      },
      {
        type: 'standard',
        position: 1,
        is_visible: true,
        settings: {
          bg_color: '#ffffff',
          bg_transparent: false,
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          title: 'Présentation',
          title_color: '#333333',
          title_font: null,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'text',
            col_start: 3,
            col_end: 11,
            settings: {
              content: 'Voici une section texte simple.',
              size: '20px',
              color: '#333333',
              align: 'center',
              vertical_align: 'top',
            },
          },
        ],
      },
      {
        type: 'standard',
        position: 2,
        is_visible: true,
        settings: {
          bg_color: '#f8f9fa',
          bg_transparent: false,
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          title: 'Image + Texte',
          title_color: '#333333',
          title_font: null,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'media',
            col_start: 1,
            col_end: 8,
            settings: {
              media_url: '/uploads/test-media/banner-2.jpg',
              align: 'left',
              vertical_align: 'center',
            },
          },
          {
            type: 'text',
            col_start: 8,
            col_end: 12,
            settings: {
              content: "Description associée à l'image.",
              size: '18px',
              color: '#000',
              align: 'left',
              vertical_align: 'center',
            },
          },
        ],
      },
      {
        type: 'standard',
        position: 3,
        is_visible: true,
        settings: {
          bg_color: '#ffffff',
          bg_transparent: false,
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          title: 'Nos services',
          title_color: '#333333',
          title_font: null,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'card',
            col_start: 1,
            col_end: 5,
            settings: {
              content: 'Description du service 1',
              media_url: '/assets/icon-consulting.svg',
            },
          },
          {
            type: 'card',
            col_start: 5,
            col_end: 9,
            settings: {
              content: 'Description du service 2',
              media_url: '/assets/icon-support.svg',
            },
          },
          {
            type: 'card',
            col_start: 9,
            col_end: 12,
            settings: {
              content: 'Description du service 3',
              media_url: '/assets/icon-event.svg',
            },
          },
        ],
      },
      {
        type: 'standard',
        position: 4,
        is_visible: true,
        settings: {
          bg_color: '#f8f9fa',
          bg_transparent: false,
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          title: 'Galerie',
          title_color: '#333333',
          title_font: null,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'gallery',
            col_start: 1,
            col_end: 4,
            settings: { media_url: '/assets/icon-consulting.svg' },
          },
          {
            type: 'gallery',
            col_start: 4,
            col_end: 7,
            settings: { media_url: '/assets/placeholder-1.svg' },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 10,
            settings: { media_url: '/assets/placeholder-2.svg' },
          },
          {
            type: 'gallery',
            col_start: 10,
            col_end: 12,
            settings: { media_url: '/assets/placeholder-3.svg' },
          },
          {
            type: 'gallery',
            col_start: 1,
            col_end: 4,
            settings: { media_url: '/assets/placeholder-person1.svg' },
          },
          {
            type: 'gallery',
            col_start: 4,
            col_end: 7,
            settings: { media_url: '/assets/placeholder-person2.svg' },
          },
          {
            type: 'youtube',
            col_start: 7,
            col_end: 10,
            settings: { youtube_url: 'https://youtu.be/2WPplCREC1c' },
          },
          {
            type: 'youtube',
            col_start: 10,
            col_end: 12,
            settings: { youtube_url: 'https://youtu.be/xbZVTo_9Bfg' },
          },
        ],
      },
      {
        type: 'footer',
        position: 999,
        is_visible: true,
        settings: {
          bg_color: '#333333',
          bg_transparent: false,
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'text',
            col_start: 1,
            col_end: 7,
            settings: {
              content: '© caixaDev 2025 - Tous droits réservés',
              color: '#ffffff',
              size: '14px',
            },
          },
          {
            type: 'media',
            col_start: 7,
            col_end: 12,
            settings: {
              social_icons: [
                { type: 'facebook', url: 'https://facebook.com' },
                { type: 'instagram', url: 'https://instagram.com' },
                { type: 'youtube', url: 'https://youtube.com' },
              ],
              align: 'right',
            },
          },
        ],
      },
    ];

    // Insérer les sections et leurs éléments
    for (const sectionData of sections) {
      const { rows: sectionRows } = await query(`
        INSERT INTO sections (page_id, type, position, is_visible, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        pageId,
        sectionData.type,
        sectionData.position,
        sectionData.is_visible,
        JSON.stringify(sectionData.settings)
      ]);

      const sectionId = sectionRows[0].id;
      logger.info(`📄 Section ${sectionData.type} créée (ID: ${sectionId})`);

      // Insérer les éléments de la section
      for (const elementData of sectionData.elements) {
        await query(`
          INSERT INTO elements (section_id, type, col_start, col_end, settings)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          sectionId,
          elementData.type,
          elementData.col_start,
          elementData.col_end,
          JSON.stringify(elementData.settings)
        ]);
      }

      logger.info(`🎯 ${sectionData.elements.length} éléments créés pour la section ${sectionData.type}`);
    }

    logger.info('✅ Base de données seedée avec succès');

  } catch (error) {
    logger.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Exécuter le seeding
seedDatabase().catch(console.error);