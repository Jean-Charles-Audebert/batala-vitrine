/**
 * Script de seed pour initialiser la base avec des données conformes au modèle JSON
 */

import { query } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('🌱 Début du seeding de la base de données...');

    // Nettoyer complètement la base avant de seed
    logger.info('🧹 Nettoyage complet de la base de données...');
    await query('TRUNCATE TABLE elements CASCADE');
    await query('TRUNCATE TABLE sections CASCADE');
    await query('TRUNCATE TABLE page CASCADE');
    await query('TRUNCATE TABLE fonts CASCADE');
    await query('TRUNCATE TABLE admins CASCADE');
    await query('TRUNCATE TABLE refresh_tokens CASCADE');
    logger.info('✅ Base de données nettoyée');

    // 1. Créer des polices par défaut
    const fonts = [
      {
        name: 'Titre par défaut',
        source: 'system',
        font_family: 'Arial',
        url: null,
        variants: ['400', '700'],
      },
      {
        name: 'Texte par défaut',
        source: 'system',
        font_family: 'Arial',
        url: null,
        variants: ['400', '700'],
      },
      {
        name: 'Inter',
        source: 'google',
        font_family: 'Inter',
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        variants: ['300', '400', '500', '600', '700'],
      },
      {
        name: 'Roboto',
        source: 'google',
        font_family: 'Roboto',
        url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
        variants: ['300', '400', '500', '700'],
      },
      {
        name: 'Open Sans',
        source: 'google',
        font_family: 'Open Sans',
        url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
        variants: ['300', '400', '600', '700'],
      },
      {
        name: 'Lato',
        source: 'google',
        font_family: 'Lato',
        url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
        variants: ['300', '400', '700'],
      },
    ];

    for (const font of fonts) {
      await query(
        `INSERT INTO fonts (name, source, font_family, url, variants)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (name) DO UPDATE
           SET source=EXCLUDED.source,
               font_family=EXCLUDED.font_family,
               url=EXCLUDED.url,
               variants=EXCLUDED.variants,
               updated_at=NOW()`,
        [
          font.name,
          font.source,
          font.font_family,
          font.url,
          JSON.stringify(font.variants),
        ]
      );
      logger.info(`🔤 Font seedée: ${font.name}`);
    }

    // Récupérer les IDs des fonts par défaut
    const { rows: titleFontRows } = await query(
      `SELECT id FROM fonts WHERE name='Titre par défaut' LIMIT 1`
    );
    const { rows: textFontRows } = await query(
      `SELECT id FROM fonts WHERE name='Texte par défaut' LIMIT 1`
    );
    const defaultFontTitleId = titleFontRows[0].id;
    const defaultFontTextId = textFontRows[0].id;

    // 2. Créer ou mettre à jour la page principale
    const { rows: pageRows } = await query(
      `
      INSERT INTO page (title, default_font_title, default_font_text, contact_email, settings)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        default_font_title = EXCLUDED.default_font_title,
        default_font_text = EXCLUDED.default_font_text,
        contact_email = EXCLUDED.contact_email,
        settings = EXCLUDED.settings
      RETURNING id
    `,
      [
        'Site Démo',
        defaultFontTitleId,
        defaultFontTextId,
        'contact@example.com',
        JSON.stringify({
          bg_color: '#ffffff',
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          bg_transparent: false,
        }),
      ]
    );

    const pageId = pageRows[0].id;
    logger.info(`📄 Page principale créée (ID: ${pageId})`);

    // 3. Créer les sections selon le modèle JSON
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
          title_font: defaultFontTitleId,
          title_size: 48,
          layout: '12-cols-grid',
          align: 'center',
          vertical_align: 'center',
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
          show_title: true,
          title_color: '#333333',
          title_font: defaultFontTitleId,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'text',
            col_start: 3,
            col_end: 11,
            settings: {
              content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              size: '20px',
              color: '#333333',
              align: 'center',
              vertical_align: 'top',
              font_id: defaultFontTextId,
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
          title_font: defaultFontTitleId,
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
              font_id: defaultFontTextId,
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
          title_font: defaultFontTitleId,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'card',
            col_start: 1,
            col_end: 5,
            settings: {
              media_url: '/assets/icon-consulting.svg',
              title: {
                text: 'Consulting',
                font_id:
                  fonts.find((f) => f.name === 'Roboto')?.id ||
                  defaultFontTitleId,
                size: '20px',
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 1',
                font_id:
                  fonts.find((f) => f.name === 'Open Sans')?.id ||
                  defaultFontTextId,
                size: '16px',
                color: '#666',
                bg_color: null,
              },
            },
          },
          {
            type: 'card',
            col_start: 5,
            col_end: 9,
            settings: {
              media_url: '/assets/icon-support.svg',
              title: {
                text: 'Support',
                font_id: defaultFontTitleId,
                size: '20px',
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 2',
                font_id: defaultFontTextId,
                size: '16px',
                color: '#666',
                bg_color: null,
              },
            },
          },
          {
            type: 'card',
            col_start: 9,
            col_end: 12,
            settings: {
              media_url: '/assets/icon-event.svg',
              title: {
                text: 'Événements',
                font_id: defaultFontTitleId,
                size: '20px',
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 3',
                font_id: defaultFontTextId,
                size: '16px',
                color: '#666',
                bg_color: null,
              },
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
          title_font: defaultFontTitleId,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { media_url: '/assets/icon-consulting.svg' },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { media_url: '/assets/placeholder-1.svg' },
          },
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { media_url: '/assets/placeholder-2.svg' },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { media_url: '/assets/placeholder-3.svg' },
          },
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { media_url: '/assets/placeholder-person1.svg' },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { media_url: '/assets/placeholder-person2.svg' },
          },
          {
            type: 'youtube',
            col_start: 1,
            col_end: 6,
            settings: { youtube_url: 'https://youtu.be/2WPplCREC1c' },
          },
          {
            type: 'youtube',
            col_start: 7,
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
              font_id: defaultFontTextId,
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

    // 4. Insérer les sections et leurs éléments
    for (const sectionData of sections) {
      const { rows: sectionRows } = await query(
        `
        INSERT INTO sections (page_id, type, position, is_visible, settings)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (page_id, type, position) DO UPDATE SET
          is_visible = EXCLUDED.is_visible,
          settings = EXCLUDED.settings
        RETURNING id
      `,
        [
          pageId,
          sectionData.type,
          sectionData.position,
          sectionData.is_visible,
          JSON.stringify(sectionData.settings),
        ]
      );

      const sectionId = sectionRows[0].id;
      logger.info(`📄 Section ${sectionData.type} créée/mise à jour (ID: ${sectionId})`);

      // Supprimer les anciens éléments de cette section avant d'en ajouter de nouveaux
      await query('DELETE FROM elements WHERE section_id = $1', [sectionId]);

      for (const elementData of sectionData.elements) {
        await query(
          `
          INSERT INTO elements (section_id, type, col_start, col_end, settings)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            sectionId,
            elementData.type,
            elementData.col_start,
            elementData.col_end,
            JSON.stringify(elementData.settings),
          ]
        );
      }

      logger.info(
        `🎯 ${sectionData.elements.length} éléments créés pour la section ${sectionData.type}`
      );
    }

    // 5. Ajouter des liens de navigation automatiques dans le HERO
    logger.info('➕ Ajout des liens de navigation par défaut dans le HERO...');

    // Récupérer le hero
    const { rows: heroRow } = await query(
      `SELECT id FROM sections WHERE page_id=$1 AND type='hero' LIMIT 1`,
      [pageId]
    );
    if (!heroRow.length) {
      logger.warn('⚠️ Aucun HERO trouvé, impossible d’ajouter les liens.');
    } else {
      const heroId = heroRow[0].id;

      // Récupérer les autres sections (sauf hero + footer)
      const { rows: otherSections } = await query(
        `SELECT id, type, position, settings
     FROM sections
     WHERE page_id=$1 AND type NOT IN ('hero', 'footer')
     ORDER BY position ASC`,
        [pageId]
      );

      // Générer les liens
      for (const sec of otherSections) {
        const sectionSettings = sec.settings || {};
        const sectionTitle = sectionSettings.title || (sec.type === 'standard' ? `Section ${sec.position}` : sec.type);

        const linkSettings = {
          link_type: 'navigation',
          label: sectionTitle, // Utilise toujours le vrai titre de la section
          target_section_id: sec.id,
          text_color: '#ffffff',
          bg_color: 'rgba(255,255,255,0.15)',
          hover_bg_color: 'rgba(255,255,255,0.35)',
          align: 'left',
          vertical_align: 'bottom',
        };

        await query(
          `
      INSERT INTO elements (section_id, type, col_start, col_end, settings)
      VALUES ($1, 'link', 4, 9, $2)
    `,
          [heroId, JSON.stringify(linkSettings)]
        );
      }

      logger.info(
        `🔗 ${otherSections.length} liens de navigation créés dans le HERO.`
      );
    }

    logger.info('✅ Base de données seedée avec succès');

    // Créer un admin par défaut si aucun n'existe
    const { rows: existingAdmins } = await query('SELECT COUNT(*) as count FROM admins');
    if (parseInt(existingAdmins[0].count) === 0) {
      logger.info('👤 Création d\'un admin par défaut...');

      // Importer argon2 pour le hashage du mot de passe
      const argon2 = await import('argon2');

      const defaultPassword = 'admin123'; // À changer en production
      const hashedPassword = await argon2.hash(defaultPassword);

      await query(
        `INSERT INTO admins (email, password_hash, is_active, is_super_admin, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin@example.com', hashedPassword, true, true, null]
      );

      logger.info('✅ Admin par défaut créé: admin@example.com / admin123');
      logger.info('⚠️  Pensez à changer le mot de passe par défaut !');
    } else {
      logger.info('ℹ️ Un admin existe déjà, pas de création');
    }

  } catch (error) {
    logger.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Exécuter le seeding
seedDatabase().catch(console.error);
