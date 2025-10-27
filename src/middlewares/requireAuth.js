// Middleware de protection pour les routes nécessitant une authentification JWT
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  // Tenter de récupérer le token depuis le header Authorization ou depuis le cookie
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    // Si requête web (accept HTML), rediriger vers login
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: 'Token d\'authentification manquant ou invalide.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attacher les infos utilisateur à la requête
    return next();
  } catch {
    // Si requête web, rediriger vers login
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/auth/login');
    }
    return res.status(401).json({ error: 'Token d\'authentification invalide ou expiré.' });
  }
}
