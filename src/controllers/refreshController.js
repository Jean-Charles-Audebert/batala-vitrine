// Contrôleur pour le refresh token JWT
import jwt from 'jsonwebtoken';

export async function refreshToken(req, res) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ error: 'Token de rafraîchissement manquant.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { sub: payload.sub, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ error: 'Token de rafraîchissement invalide.' });
  }
}
