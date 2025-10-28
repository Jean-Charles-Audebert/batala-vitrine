import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import refreshRoutes from "./routes/refreshRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import { logger } from "./utils/logger.js";

dotenv.config();

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
        "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        "font-src": ["'self'", "https://cdnjs.cloudflare.com"],
        "img-src": ["'self'", "data:", "https:"],
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
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// --- Routes ---
app.use("/", router);
app.use("/admins", adminRoutes);
app.use("/auth", authRoutes);
app.use("/auth", refreshRoutes);
app.use("/blocks", blockRoutes);
app.use("/api", apiRoutes);

// --- Lancement du serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.success(`Serveur en ligne sur http://localhost:${PORT}`);
});
