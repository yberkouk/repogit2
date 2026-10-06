// Authentification HTTP Basic du back-office.
// Identifiants par défaut : admin / admin. À surcharger en production avec
// les variables d'environnement ADMIN_USER et ADMIN_PASSWORD.
const crypto = require('crypto');

const USER = process.env.ADMIN_USER || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isAuthorized(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const okUser = safeEqual(decoded.slice(0, sep), USER);
  const okPass = safeEqual(decoded.slice(sep + 1), PASSWORD);
  return okUser && okPass;
}

module.exports = { isAuthorized };
