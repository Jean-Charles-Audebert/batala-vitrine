import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
  listFonts,
  showAddGoogleFont,
  addGoogleFont,
  uploadFont,
  deleteFont
} from '../controllers/fontController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Protéger toutes les routes avec requireAuth
router.use(requireAuth);

// Configuration multer pour l'upload de fichiers de police
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `font-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.woff2', '.woff', '.ttf', '.otf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format de police non supporté. Utilisez woff2, woff, ttf ou otf.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

// Liste des polices
router.get('/', listFonts);

// Formulaire Google Fonts
router.get('/google/new', showAddGoogleFont);

// Ajouter une police Google Fonts
router.post('/google', addGoogleFont);

// Upload d'une police
router.post('/upload', upload.single('font_file'), uploadFont);

// Supprimer une police
router.post('/:id/delete', deleteFont);

export default router;
