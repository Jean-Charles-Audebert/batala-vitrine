import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Configuration ESM pour __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Stocker dans public/uploads/
    const uploadDir = path.join(__dirname, "../../public/uploads");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Validation du type de fichier
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Type de fichier non autorisé. Formats acceptés : ${allowedTypes.join(", ")}`
      ),
      false
    );
  }
};

// Configuration de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

// Middleware pour gérer les erreurs multer
export const handleMulterError = (err, req, res, next) => {
  // Vérifier si c'est une MulterError (utiliser le nom du constructeur)
  const isMulterError = err && err.constructor && err.constructor.name === "MulterError";

  if (isMulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Fichier trop volumineux. Taille maximale : 5 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload : ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};
