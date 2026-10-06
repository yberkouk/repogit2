// Back-office : GET liste, PATCH (marquer lu/non lu), DELETE.
// Protégé par authentification HTTP Basic (voir lib/auth.js).
const store = require('../lib/store');
const { isAuthorized } = require('../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAuthorized(req)) {
    // Pas d'en-tête WWW-Authenticate : la page admin gère sa propre connexion.
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const id = (req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id');
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ contacts: await store.list(), storage: store.backend });
    }
    if (req.method === 'PATCH' && id) {
      let body = req.body || {};
      if (typeof body === 'string') body = JSON.parse(body || '{}');
      const updated = await store.update(id, { lu: !!body.lu });
      return updated ? res.status(200).json(updated) : res.status(404).json({ error: 'Introuvable' });
    }
    if (req.method === 'DELETE' && id) {
      return (await store.remove(id)) ? res.status(204).end() : res.status(404).json({ error: 'Introuvable' });
    }
    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
