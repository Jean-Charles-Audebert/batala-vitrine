/**
 * Seed complet : toutes les sections conservées, Hero/Footer dynamiques, DRY
 */
import { pool } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import argon2 from 'argon2';
import 'dotenv/config';

// --- Seed principal ---
async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.info('🧹 Nettoyage complet de la base de données...');
    await client.query('TRUNCATE TABLE elements CASCADE');
    await client.query('TRUNCATE TABLE sections CASCADE');
    await client.query('TRUNCATE TABLE page CASCADE');
    await client.query('TRUNCATE TABLE fonts CASCADE');
    await client.query('TRUNCATE TABLE admins CASCADE');
    await client.query('TRUNCATE TABLE refresh_tokens CASCADE');
    await client.query('TRUNCATE TABLE social_links CASCADE');
    await client.query('TRUNCATE TABLE nav_links CASCADE');
    logger.info('✅ Base de données nettoyée');

    // --- Seed admins ---
    async function seedAdmins() {
      const admins = [
        {
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          is_super_admin: false,
        },
        {
          email: process.env.SUPER_ADMIN_EMAIL,
          password: process.env.SUPER_ADMIN_PASSWORD,
          is_super_admin: true,
        },
      ];
      for (const admin of admins) {
        if (!admin.email || !admin.password) continue;
        const { rows: existing } = await client.query(
          `SELECT id FROM admins WHERE email=$1 LIMIT 1`,
          [admin.email]
        );
        if (existing.length > 0) continue;
        const hashed = await argon2.hash(admin.password);
        await client.query(
          `INSERT INTO admins (email, password_hash, is_active, is_super_admin, created_by)
           VALUES ($1,$2,$3,$4,$5)`,
          [admin.email, hashed, true, admin.is_super_admin, null]
        );
      }
    }

    // --- Fonction DRY pour injecter nav_links et social_links dans Hero/Footer ---
    async function injectDynamicElements(sectionId, pageId) {
      logger.info(`Injecting dynamic elements for section ${sectionId}, page ${pageId}`);
      // nav_links dynamiques
      const { rows: otherSections } = await client.query(
        `SELECT id, settings, type, position FROM sections WHERE page_id=$1 AND type NOT IN ('hero','footer') ORDER BY position ASC`,
        [pageId]
      );
      for (const sec of otherSections) {
        const label = sec.settings?.title || `Section ${sec.position}`;
        const navEl = {
          link_type: 'navigation',
          label,
          target_section_id: sec.id,
          text_color: '#fff',
          bg_color: 'rgba(255,255,255,0.15)',
          hover_bg_color: 'rgba(255,255,255,0.35)',
          align: 'left',
          vertical_align: 'bottom',
        };
        await client.query(
          `INSERT INTO elements (section_id,type,col_start,col_end,settings) VALUES ($1,'link',4,9,$2)`,
          [sectionId, JSON.stringify(navEl)]
        );
      }

      // social_links dynamiques - récupérer les liens existants et créer les éléments
      const { rows: socials } = await client.query(
        `SELECT id, label, url, icon_name, settings FROM social_links ORDER BY position ASC`
      );
      for (const s of socials) {
        const socialEl = {
          link_type: 'social',
          label: s.label,
          url: s.url,
          icon_name: s.icon_name,
          color: s.settings?.color || '#fff',
          hover_color: s.settings?.hover_color || '#ccc',
          size: s.settings?.size || '44px',
        };
        await client.query(
          `INSERT INTO elements (section_id,type,col_start,col_end,settings) VALUES ($1,'link',10,12,$2)`,
          [sectionId, JSON.stringify(socialEl)]
        );
      }
    }

    // Fonts
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
    for (const f of fonts)
      await client.query(
        `INSERT INTO fonts (name, source, font_family, url, variants)
       VALUES ($1,$2,$3,$4,$5)`,
        [f.name, f.source, f.font_family, f.url, JSON.stringify(f.variants)]
      );
    const { rows: titleFontRows } = await client.query(
      `SELECT id FROM fonts WHERE name='Titre par défaut' LIMIT 1`
    );
    const { rows: textFontRows } = await client.query(
      `SELECT id FROM fonts WHERE name='Texte par défaut' LIMIT 1`
    );
    const defaultFontTitleId = titleFontRows[0].id;
    const defaultFontTextId = textFontRows[0].id;

    // Page principale
    const { rows: pageRows } = await client.query(
      `INSERT INTO page (title, default_font_title, default_font_text, contact_email, settings)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [
        'Site Démo',
        defaultFontTitleId,
        defaultFontTextId,
        'contact@example.com',
        JSON.stringify({
          bg_color: '#fff',
          bg_image: null,
          bg_video: null,
          bg_video_youtube: null,
          bg_transparent: false,
        }),
      ]
    );
    const pageId = pageRows[0].id;

    // --- Toutes tes sections existantes (standard, gallery, card, etc.) ---
    const sections = [
      {
        type: 'standard',
        position: 1,
        is_visible: true,
        settings: {
          // --- Title group ---
          title: 'Présentation',
          title_font: defaultFontTitleId,
          title_color: '#333',
          title_size: 32,
          show_title: true,
          
          // --- Background group ---
          bg_type: 'color', // 'color' | 'media' | 'youtube'
          bg_color: '#fff',
          bg_image: null,
          bg_video: null,
          bg_youtube: null,
          
          // --- Transparency group ---
          bg_transparent: false,
          
          // --- Layout ---
          layout: '12-cols-grid',
          align: 'center',
        },
        elements: [
          {
            type: 'text',
            col_start: 3,
            col_end: 11,
            settings: {
              content: 'Lorem ipsum dolor sit amet...',
              font_id: defaultFontTextId,
              size: 20, // px
              color: '#333',
              bg_color: null,
              align: 'center', // 'left' | 'center' | 'right'
              vertical_align: 'top', // 'top' | 'center' | 'bottom'
              padding: 0, // px
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
          title: 'Image + Texte',
          title_color: '#333',
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
              media_type: 'image',
              width: 'auto',
              height: null, // px or null for auto
              align: 'left',
              vertical_align: 'center',
              alt_text: 'Banner',
            },
          },
          {
            type: 'text',
            col_start: 8,
            col_end: 12,
            settings: {
              content: "Description associée à l'image.",
              font_id: defaultFontTextId,
              size: 18, // px
              color: '#000',
              bg_color: null,
              align: 'left',
              vertical_align: 'center',
              padding: 0,
            },
          },
        ],
      },
      {
        type: 'standard',
        position: 3,
        is_visible: true,
        settings: {
          bg_color: '#fff',
          title: 'Nos services',
          title_color: '#333',
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
              media_type: 'image',
              width: 'auto',
              height: 60, // px
              align: 'center',
              vertical_align: 'top',
              title: {
                text: 'Consulting',
                font_id: defaultFontTitleId,
                size: 20, // px
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 1',
                font_id: defaultFontTextId,
                size: 16, // px
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
              media_type: 'image',
              width: 'auto',
              height: 60, // px
              align: 'center',
              vertical_align: 'top',
              title: {
                text: 'Support',
                font_id: defaultFontTitleId,
                size: 20, // px
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 2',
                font_id: defaultFontTextId,
                size: 16, // px
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
              media_type: 'image',
              width: 'auto',
              height: 60, // px
              align: 'center',
              vertical_align: 'top',
              title: {
                text: 'Événements',
                font_id: defaultFontTitleId,
                size: 20, // px
                color: '#333',
                bg_color: null,
              },
              description: {
                text: 'Description du service 3',
                font_id: defaultFontTextId,
                size: 16, // px
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
          title: 'Galerie',
          title_color: '#333',
          title_font: defaultFontTitleId,
          title_size: 32,
          layout: '12-cols-grid',
        },
        elements: [
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { 
              media_url: '/assets/icon-consulting.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 1',
            },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { 
              media_url: '/assets/placeholder-1.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 2',
            },
          },
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { 
              media_url: '/assets/placeholder-2.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 3',
            },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { 
              media_url: '/assets/placeholder-3.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 4',
            },
          },
          {
            type: 'gallery',
            col_start: 1,
            col_end: 6,
            settings: { 
              media_url: '/assets/placeholder-person1.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 5',
            },
          },
          {
            type: 'gallery',
            col_start: 7,
            col_end: 12,
            settings: { 
              media_url: '/assets/placeholder-person2.svg',
              media_type: 'image',
              width: 'auto',
              height: null,
              align: 'center',
              vertical_align: 'center',
              alt_text: 'Image 6',
            },
          },
          {
            type: 'youtube',
            col_start: 1,
            col_end: 6,
            settings: { 
              youtube_url: 'https://youtu.be/2WPplCREC1c',
              align: 'center',
              vertical_align: 'center',
              autoplay: false,
              mute: false,
              loop: false,
            },
          },
          {
            type: 'youtube',
            col_start: 7,
            col_end: 12,
            settings: { 
              youtube_url: 'https://youtu.be/xbZVTo_9Bfg',
              align: 'center',
              vertical_align: 'center',
              autoplay: false,
              mute: false,
              loop: false,
            },
          },
        ],
      },
    ];

    for (const secData of sections) {
      const { rows: secRows } = await client.query(
        `INSERT INTO sections (page_id,type,position,is_visible,settings)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [
          pageId,
          secData.type,
          secData.position,
          secData.is_visible,
          JSON.stringify(secData.settings),
        ]
      );
      const secId = secRows[0].id;
      await client.query('DELETE FROM elements WHERE section_id=$1', [secId]);
      for (const el of secData.elements) {
        await client.query(
          `INSERT INTO elements (section_id,type,col_start,col_end,settings)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            secId,
            el.type,
            el.col_start,
            el.col_end,
            JSON.stringify(el.settings),
          ]
        );
      }
    }

    // Social links par défaut - insérés une seule fois
    const socialLinks = [
      {
        label: 'Facebook',
        url: 'https://facebook.com',
        icon_name: 'fa-brands fa-facebook',
        position: 1,
        settings: { color: '#fff', hover_color: '#3b5998', size: '44px' },
      },
      {
        label: 'Instagram',
        url: 'https://instagram.com',
        icon_name: 'fa-brands fa-instagram',
        position: 2,
        settings: { color: '#fff', hover_color: '#d6249f', size: '44px' },
      },
      {
        label: 'YouTube',
        url: 'https://youtube.com',
        icon_name: 'fa-brands fa-youtube',
        position: 3,
        settings: { color: '#fff', hover_color: '#FF0000', size: '44px' },
      },
    ];

    for (const s of socialLinks) {
      await client.query(
        `INSERT INTO social_links (label,url,icon_name,position,settings)
           VALUES ($1,$2,$3,$4,$5)`,
        [s.label, s.url, s.icon_name, s.position, JSON.stringify(s.settings)]
      );
    }
    logger.info(`Inserted ${socialLinks.length} social links`);

    // Hero et Footer dynamiques
    const heroId = (
      await client.query(
        `INSERT INTO sections (page_id,type,position,is_visible,settings)
     VALUES ($1,'hero',0,true,$2) RETURNING id`,
        [
          pageId,
          JSON.stringify({
            // --- Title group ---
            title: 'Bienvenue',
            title_font: defaultFontTitleId,
            title_color: '#000',
            title_size: 80,
            show_title: true,
            
            // --- Background group ---
            bg_type: 'media', // 'color' | 'media' | 'youtube'
            bg_color: '#f0f0f0',
            bg_image: '/assets/header-bg-default.svg',
            bg_video: null,
            bg_youtube: null,
            
            // --- Transparency group ---
            bg_transparent: false,
            
            // --- Layout ---
            layout: '12-cols-grid',
            align: 'center',
            vertical_align: 'center',
            
            // --- Logo (hero-specific, position via elements) ---
            logo_visible: true,
            logo_align: 'left',
            logo_vertical_align: 'center',
            logo_width: 150,
            
            // --- Hero Title (hero-specific) ---
            title_align: 'center',
            title_vertical_align: 'center',
            
            // --- Navigation (hero-specific, position via elements) ---
            nav_align: 'center',
            nav_vertical_align: 'bottom',
            nav_text_color: '#ffffff',
            nav_bg_color: 'rgba(255,255,255,0.25)',
            
            // --- Social Links (hero-specific) ---
            social_align: 'right',
            social_vertical_align: 'top',
            social_icon_size: 24,
            social_icon_color: '#ffffff'
          }),
        ]
      )
    ).rows[0].id;

    // Hero - Logo element
    await client.query(
      `INSERT INTO elements (section_id,type,col_start,col_end,settings)
   VALUES ($1,'media',1,3,$2)`,
      [
        heroId,
        JSON.stringify({
          media_url: '/assets/logo-default.svg',
          media_type: 'image', // 'image' | 'video'
          width: 'auto', // 'auto' | px value
          height: 80, // px
          align: 'left', // 'left' | 'center' | 'right'
          vertical_align: 'center', // 'top' | 'center' | 'bottom'
          alt_text: 'Logo',
        }),
      ]
    );

    const footerId = (
      await client.query(
        `INSERT INTO sections (page_id,type,position,is_visible,settings)
       VALUES ($1,'footer',999,true,$2) RETURNING id`,
        [
          pageId,
          JSON.stringify({
            // --- Background group ---
            bg_type: 'color',
            bg_color: '#333',
            bg_image: null,
            bg_video: null,
            bg_youtube: null,
            
            // --- Transparency group ---
            bg_transparent: false,
            
            // --- Layout ---
            layout: '12-cols-grid',
            
            // --- Footer Content (footer-specific) ---
            footer_content_bg: 'rgba(255, 255, 255, 0.1)',
            footer_content_color: '#ffffff',
            content_link_color: '#ffffff',
          }),
        ]
      )
    ).rows[0].id;

    // Inject dynamiques
    await injectDynamicElements(heroId, pageId);
    await injectDynamicElements(footerId, pageId);

    // Seed admins
    await seedAdmins();
    logger.info(
      '✅ Seed complet Hero/Footer dynamiques avec toutes les sections conservées'
    );

    // Vérification finale
    const { rows: finalCheck } = await client.query('SELECT COUNT(*) FROM social_links');
    logger.info(`Final count of social links: ${finalCheck[0].count}`);
    await client.query('COMMIT');

    // Vérification après commit
    const { rows: afterCommit } = await client.query('SELECT * FROM social_links');
    logger.info(`After commit: ${afterCommit.length} social links`);
  } catch (err) {
    logger.error('❌ Erreur seed:', err);
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seedDatabase().catch(console.error);
