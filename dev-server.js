// Serveur de développement sans dépendance : node dev-server.js
// Sert les fichiers statiques et les fonctions /api comme sur Vercel.
// Le back-office est disponible sur http://admin.localhost:3000 (sous-domaine)
// ou http://localhost:3000/admin/.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };

function vercelLike(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); return res; };
  return res;
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const host = (req.headers.host || '').split(':')[0];

  if (url.pathname.startsWith('/api/')) {
    const file = path.join(ROOT, 'api', path.basename(url.pathname) + '.js');
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('Not found'); }
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
      req.query = Object.fromEntries(url.searchParams);
      Promise.resolve(require(file)(req, vercelLike(res))).catch((err) => {
        console.error(err); res.statusCode = 500; res.end('Erreur');
      });
    });
    return;
  }

  let pathname = url.pathname;
  if (pathname === '/' && host.startsWith('admin.')) pathname = '/admin/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.normalize(path.join(ROOT, pathname));
  if (!file.startsWith(ROOT + path.sep) || /[\\/](api|lib|data|\.git)[\\/]/.test(file.slice(ROOT.length))) {
    res.statusCode = 403; return res.end('Interdit');
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Site        : http://localhost:${PORT}`);
  console.log(`Back-office : http://admin.localhost:${PORT}  (admin / admin)`);
});
