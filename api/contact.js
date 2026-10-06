// POST /api/contact : enregistre une demande envoyée depuis le site.
const crypto = require('crypto');
const store = require('../lib/store');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Champ piège anti-spam : rempli uniquement par les robots.
  if (body.website) return res.status(200).json({ ok: true });

  const contact = {
    id: crypto.randomUUID(),
    nom: clean(body.nom, 120),
    email: clean(body.email, 200).toLowerCase(),
    message: clean(body.message, 5000),
    createdAt: new Date().toISOString(),
    lu: false
  };
  if (!contact.nom || !EMAIL_RE.test(contact.email)) {
    return res.status(400).json({ error: 'Nom et e-mail valides requis' });
  }

  try {
    await store.add(contact);
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Enregistrement impossible' });
  }
};
