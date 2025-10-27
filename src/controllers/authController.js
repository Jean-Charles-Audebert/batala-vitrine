import { query } from '../config/db.js';
import { verifyPassword } from '../utils/password.js';
import jwt from 'jsonwebtoken';
import { refreshCookieOptions, accessCookieOptions, clearCookieOptions } from '../config/cookies.js';

export async function login(req, res, deps = {}) {
  const {
    query: _query = query,
    verifyPassword: _verifyPassword = verifyPassword,
    jwt: _jwt = jwt,
  } = deps;
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }
  try {
    const { rows } = await _query('SELECT id, email, password_hash, is_active FROM admins WHERE email=$1', [email]);
    const admin = rows[0];
    if (!admin || !admin.is_active) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const valid = await _verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    // Générer JWT
    const payload = { sub: admin.id, email: admin.email };
    const accessToken = _jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = _jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
    // Cookie sécurisé pour le refresh
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);
    return res.json({ accessToken });
  } catch {
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}

function clearAuthCookies(res) {
  const opts = clearCookieOptions();
  res.clearCookie('refresh_token', opts);
  res.clearCookie('access_token', opts);
}

export function logout(req, res) {
  clearAuthCookies(res);
  return res.json({ message: 'Déconnexion réussie.' });
}

export function logoutWeb(req, res) {
  clearAuthCookies(res);
  return res.redirect('/auth/login');
}

export function showLoginPage(req, res) {
  res.render('login', { title: 'Connexion' });
}

export async function loginWeb(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { title: 'Connexion', error: 'Email et mot de passe requis.' });
  }
  try {
    const { rows } = await query('SELECT id, email, password_hash, is_active FROM admins WHERE email=$1', [email]);
    const admin = rows[0];
    if (!admin || !admin.is_active) {
      return res.render('login', { title: 'Connexion', error: 'Identifiants invalides.' });
    }
    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return res.render('login', { title: 'Connexion', error: 'Identifiants invalides.' });
    }
    // Générer JWT et stocker dans cookie
    const payload = { sub: admin.id, email: admin.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
    // Cookie pour refresh et access
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);
    res.cookie('access_token', accessToken, accessCookieOptions);
    return res.redirect('/admins');
  } catch {
    return res.render('login', { title: 'Connexion', error: 'Erreur serveur.' });
  }
}
