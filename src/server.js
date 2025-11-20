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
import footerElementRoutes from "./routes/footerElementRoutes.js";
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

app.use("/", footerElementRoutes);

app.use("/api", apiRoutes);
app.use("/api", sectionsApiRoutes);
app.use("/api", socialLinksRoutes);
// app.use("/api", cardRoutes); // Supprimé - système legacy remplacé par sections v2
app.use("/api/admin", adminContentRoutes);
app.use("/admin", adminDashboardRoutes);
app.use("/admin", settingsRoutes);

// --- Lancement du serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
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
});
