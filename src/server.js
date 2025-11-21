import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// IMPORTANT: charger dotenv EN PREMIER avant tout import qui utilise process.env
dotenv.config();

import helmet from "helmet";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import router from "./routes/index.js";
import healthRoutes from "./routes/health.js";
// import adminRoutes from "./routes/adminRoutes.js"; // Supprimé - remplacé par SPA
import authRoutes from "./routes/authRoutes.js";
import refreshRoutes from "./routes/refreshRoutes.js";
// import blockRoutes from "./routes/blockRoutes.js"; // Supprimé - système legacy remplacé par sections v2
// import cardRoutes from "./routes/cardRoutes.js"; // Supprimé - système legacy remplacé par sections v2
// import footerElementRoutes from "./routes/footerElementRoutes.js";
// import fontRoutes from "./routes/fontRoutes.js"; // Supprimé - remplacé par SPA
import apiRoutes from "./routes/apiRoutes.js";
import sectionsAdminRoutes from "./routes/sectionsAdminRoutes.js";
import sectionsApiRoutes from "./routes/sectionsApiRoutes.js";
import socialLinksRoutes from "./routes/socialLinksRoutes.js";
import adminContentRoutes from "./routes/adminContentRoutes.js";
import settingsRoutes from "./routes/settings.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import { sendContactEmail } from "./controllers/contactController.js";
import { logger } from "./utils/logger.js";
import { query } from "./config/db.js";

/**
 * Initialise les sections par défaut si aucune n'existe
 */
async function initializeDefaultSections() {
  try {
    // Vérifier s'il y a déjà des sections
    const { rows } = await query('SELECT COUNT(*) as count FROM sections');
    if (rows[0].count > 0) {
      logger.info(`✅ ${rows[0].count} sections déjà présentes`);
      return;
    }

    logger.info('🚀 Initialisation des sections par défaut...');

    // Créer les sections par défaut
    const defaultSections = [
      {
        type: 'hero',
        title: 'Bienvenue',
        position: 1,
        layout: null,
        is_visible: true
      },
      {
        type: 'content',
        title: 'À propos',
        position: 2,
        layout: 'image_left',
        is_visible: true
      },
      {
        type: 'card_grid',
        title: 'Nos prestations',
        position: 3,
        layout: 'grid_3',
        is_visible: true
      },
      {
        type: 'footer',
        title: 'Contact',
        position: 999,
        layout: null,
        is_visible: true
      }
    ];

    for (const section of defaultSections) {
      await query(`
        INSERT INTO sections (type, title, position, layout, is_visible, padding_top, padding_bottom)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        section.type,
        section.title,
        section.position,
        section.layout,
        section.is_visible,
        'medium',
        'medium'
      ]);
      logger.info(`📄 Section créée: ${section.type} - ${section.title}`);
    }

    // Créer du contenu par défaut pour la section hero
    await query(`
      INSERT INTO section_content (section_id, title, subtitle, description, cta_label, cta_url, position)
      SELECT id, 'Site Vitrine', 'caixaDev', 'Créons ensemble votre présence en ligne', 'Nous contacter', '#contact', 0
      FROM sections WHERE type = 'hero' LIMIT 1
    `);

    // Créer du contenu par défaut pour la section content
    await query(`
      INSERT INTO section_content (section_id, title, description, position)
      SELECT id, 'À propos de nous', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Proin tortor purus platea sit eu id nisi litora libero.', 0
      FROM sections WHERE type = 'content' LIMIT 1
    `);

    // Créer des cartes par défaut pour la section card_grid
    const cardGridId = await query('SELECT id FROM sections WHERE type = $1', ['card_grid']);
    if (cardGridId.rows.length > 0) {
      const cards = [
        {
          title: 'Lorem ipsum',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
          position: 0,
        },
        {
          title: 'Lorem ipsum',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
          position: 1,
        },
        {
          title: 'Lorem ipsum',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
          position: 2,
        },
      ];

      for (const card of cards) {
        await query(`
          INSERT INTO cards_v2 (section_id, title, description, position)
          VALUES ($1, $2, $3, $4)
        `, [cardGridId.rows[0].id, card.title, card.description, card.position]);
      }
      logger.info('🃏 Cartes par défaut créées');
    }

    logger.success('✅ Sections par défaut initialisées avec succès');

  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des sections:', error);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Helmet : sécurité renforcée adaptée au SSR ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "media-src": ["'self'", "data:", "https:"],
        "frame-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://player.vimeo.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "no-referrer" },
    hidePoweredBy: true,
    noSniff: true,
  })
);

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// --- Fichiers statiques ---
app.use(express.static(path.join(__dirname, "../public")));

// --- Configuration du moteur de vues ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configuration des layouts EJS
app.use(expressLayouts);
app.set("layout", false); // Layout par défaut désactivé, on le spécifie par page

// Désactiver le cache EJS en développement
if (process.env.NODE_ENV === "development") {
  app.set("view cache", false);
}

// Injecter des helpers globaux dans tous les templates
import { getOriginalPath } from "./utils/viewHelpers.js";
app.locals.getOriginalPath = getOriginalPath;

// --- Middleware pour layout admin ---
app.use((req, res, next) => {
  // Détecter les routes admin et appliquer le layout automatiquement
  if (req.path.startsWith('/admin') || req.path.startsWith('/admins') || req.path.startsWith('/sections') || req.path.startsWith('/fonts')) {
    res.locals.layout = 'layouts/admin';
  }
  next();
});

// --- Routes ---
app.use("/", router);
app.use("/", healthRoutes);
// app.use("/admins", adminRoutes); // Supprimé - remplacé par /admin?section=admins
app.use("/auth", authRoutes);
app.use("/auth", refreshRoutes);
// app.use("/blocks", blockRoutes); // Supprimé - système legacy remplacé par sections v2
// app.use("/blocks/:blockId/cards", cardRoutes); // Supprimé - système legacy remplacé par sections v2
// Redirections vers le SPA admin
app.get("/fonts", (req, res) => res.redirect("/admin?section=fonts"));
// app.get("/blocks", (req, res) => res.redirect("/admin?section=blocks")); // Supprimé - blocs plus utilisés
app.get("/admins", (req, res) => res.redirect("/admin?section=admins"));
app.use("/sections", sectionsAdminRoutes);

// Route de contact PUBLIQUE (AVANT footerElementRoutes pour éviter son middleware global)
app.post("/contact", sendContactEmail);

// app.use("/", footerElementRoutes); // TODO: Supprimé - système legacy blocks

app.use("/api", apiRoutes);
app.use("/api", sectionsApiRoutes);
app.use("/api", socialLinksRoutes);
// app.use("/api", cardRoutes); // Supprimé - système legacy remplacé par sections v2
app.use("/api/admin", adminContentRoutes);
app.use("/admin", adminDashboardRoutes);
app.use("/admin", settingsRoutes);

// --- Lancement du serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  logger.success(`Serveur en ligne sur http://localhost:${PORT}`);

  // Diagnostic base de données au démarrage en développement uniquement
  if (process.env.NODE_ENV === "development") {
    (async () => {
      try {
        const info = await query(
          "SELECT current_database() AS db, current_user AS usr, inet_server_addr() AS host, inet_server_port() AS port"
        );
        const searchPath = await query("SHOW search_path");
        const cardsExists = await query(
          "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cards') AS exists"
        );
        logger.info(
          `DB diagnostic → db=${info.rows[0].db} user=${info.rows[0].usr} host=${info.rows[0].host}:${info.rows[0].port} search_path=${searchPath.rows[0].search_path} cards=${cardsExists.rows[0].exists}`
        );
      } catch (e) {
        logger.error("DB diagnostic a échoué", e);
      }
    })();
  }

  // Initialiser les sections par défaut
  await initializeDefaultSections();
});
