// Middleware optionnel pour récupérer l'utilisateur sans bloquer
import jwt from 'jsonwebtoken';

export function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  }

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch {
      // Token invalide, on continue sans utilisateur
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  return next();
}
