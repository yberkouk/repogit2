// Back-office : connexion, liste, recherche, export CSV des contacts.
(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = 'ybcoaching-admin';
  let auth = null;
  let contacts = [];

  try { auth = sessionStorage.getItem(KEY); } catch { /* stockage indisponible */ }

  async function api(method, query, body) {
    const res = await fetch('/api/contacts' + (query || ''), {
      method,
      headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) { logout(); throw new Error('Session expirée'); }
    if (!res.ok) throw new Error('Erreur ' + res.status);
    return res.status === 204 ? null : res.json();
  }

  function showView(loggedIn) {
    $('login-view').hidden = loggedIn;
    $('contacts-view').hidden = !loggedIn;
    $('logout').hidden = !loggedIn;
  }

  function logout() {
    auth = null;
    try { sessionStorage.removeItem(KEY); } catch {}
    showView(false);
  }

  async function load() {
    const data = await api('GET');
    contacts = data.contacts;
    $('storage-notice').hidden = data.storage !== 'file';
    render();
  }

  const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  function cell(tr, className, text) {
    const td = document.createElement('td');
    if (className) td.className = className;
    if (text instanceof Node) td.append(text); else td.textContent = text;
    tr.append(td);
    return td;
  }

  function button(label, action, id, extraClass) {
    const b = document.createElement('button');
    b.className = 'icon-btn' + (extraClass ? ' ' + extraClass : '');
    b.textContent = label;
    b.dataset.action = action;
    b.dataset.id = id;
    return b;
  }

  function render() {
    const q = $('search').value.trim().toLowerCase();
    const onlyUnread = $('only-unread').checked;
    const visible = contacts.filter(c =>
      (!onlyUnread || !c.lu) &&
      (!q || [c.nom, c.email, c.message].join(' ').toLowerCase().includes(q)));

    const rows = $('rows');
    rows.replaceChildren();
    for (const c of visible) {
      const tr = document.createElement('tr');
      if (!c.lu) tr.className = 'unread';
      cell(tr, 'date', fmt.format(new Date(c.createdAt)));
      cell(tr, 'name', c.nom);
      const mail = document.createElement('a');
      mail.href = 'mailto:' + c.email;
      mail.textContent = c.email;
      cell(tr, '', mail);
      cell(tr, 'msg', c.message || '—');
      const actions = cell(tr, 'actions', '');
      actions.append(
        button(c.lu ? 'Marquer non lu' : 'Marquer lu', 'toggle', c.id),
        button('Supprimer', 'delete', c.id, 'icon-btn--danger'));
      rows.append(tr);
    }
    $('empty').hidden = visible.length > 0;
    $('empty').textContent = contacts.length ? 'Aucun résultat pour ce filtre.' : 'Aucune demande pour le moment.';

    const weekAgo = Date.now() - 7 * 864e5;
    $('stat-total').textContent = contacts.length;
    $('stat-unread').textContent = contacts.filter(c => !c.lu).length;
    $('stat-week').textContent = contacts.filter(c => new Date(c.createdAt) > weekAgo).length;
  }

  function exportCsv() {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [['Date', 'Nom', 'E-mail', 'Message', 'Lu'].map(esc).join(';')];
    for (const c of contacts) lines.push([c.createdAt, c.nom, c.email, c.message, c.lu ? 'oui' : 'non'].map(esc).join(';'));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contacts-ybcoaching-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    auth = btoa(unescape(encodeURIComponent(f.get('user') + ':' + f.get('password'))));
    const err = document.querySelector('.login__error');
    try {
      await load();
      try { sessionStorage.setItem(KEY, auth); } catch {}
      err.hidden = true;
      e.target.reset();
      showView(true);
    } catch (ex) {
      err.textContent = 'Identifiant ou mot de passe incorrect.';
      err.hidden = false;
    }
  });

  $('rows').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const c = contacts.find(x => x.id === b.dataset.id);
    if (!c) return;
    try {
      if (b.dataset.action === 'delete') {
        if (!confirm('Supprimer la demande de ' + c.nom + ' ?')) return;
        await api('DELETE', '?id=' + encodeURIComponent(c.id));
        contacts = contacts.filter(x => x !== c);
      } else {
        Object.assign(c, await api('PATCH', '?id=' + encodeURIComponent(c.id), { lu: !c.lu }));
      }
      render();
    } catch (ex) { alert(ex.message); }
  });

  $('search').addEventListener('input', render);
  $('only-unread').addEventListener('change', render);
  $('refresh').addEventListener('click', () => load().catch(ex => alert(ex.message)));
  $('export').addEventListener('click', exportCsv);
  $('logout').addEventListener('click', logout);

  if (auth) load().then(() => showView(true)).catch(() => showView(false));
  else showView(false);
})();
