// Stockage des contacts.
// - Production (Vercel) : Redis Upstash via son API REST, configuré par
//   KV_REST_API_URL / KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL / _TOKEN).
// - Sinon : fichier JSON local (développement uniquement, non persistant sur Vercel).
const fs = require('fs');
const path = require('path');
const os = require('os');

const KEY = 'ybcoaching:contacts';
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const FILE = process.env.CONTACTS_FILE ||
  path.join(process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '..', 'data'), 'contacts.json');

async function redis(...command) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error('Redis: ' + (data.error || res.status));
  return data.result;
}

function readFile() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}
function writeFile(all) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

const backend = REDIS_URL && REDIS_TOKEN ? 'redis' : 'file';

async function add(contact) {
  if (backend === 'redis') await redis('HSET', KEY, contact.id, JSON.stringify(contact));
  else { const all = readFile(); all[contact.id] = contact; writeFile(all); }
}

async function list() {
  let items;
  if (backend === 'redis') {
    const flat = (await redis('HGETALL', KEY)) || [];
    items = [];
    for (let i = 1; i < flat.length; i += 2) items.push(JSON.parse(flat[i]));
  } else {
    items = Object.values(readFile());
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function remove(id) {
  if (backend === 'redis') return (await redis('HDEL', KEY, id)) > 0;
  const all = readFile();
  if (!all[id]) return false;
  delete all[id];
  writeFile(all);
  return true;
}

async function update(id, fields) {
  const items = await list();
  const current = items.find(c => c.id === id);
  if (!current) return null;
  const next = { ...current, ...fields };
  await add(next);
  return next;
}

module.exports = { add, list, remove, update, backend };
