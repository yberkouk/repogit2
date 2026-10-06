# repogit2

Site vitrine **YBCoaching — Younouss BERKOUK, Coach Agile** (HTML/CSS/JS statiques, sans dépendance) avec un back-office des demandes de contact.

- `index.html` : structure de la page (hero, services, approche, résultats, témoignages, contact)
- `style.css` : styles, responsive et mode sombre automatique
- `chart.js` : graphique interactif vélocité / lead time en SVG
- `contact.js` : envoi du formulaire de contact vers `/api/contact`
- `assets/logo.svg`, `assets/favicon.svg` : logo YBCoaching (monogramme YB)
- `admin/` : back-office des contacts (connexion, recherche, lu/non lu, suppression, export CSV)
- `api/contact.js`, `api/contacts.js` : fonctions serverless Vercel ; `lib/` : stockage et authentification

## En local

```sh
node dev-server.js
```

- Site : http://localhost:3000
- Back-office : http://admin.localhost:3000 (ou http://localhost:3000/admin/)

Les contacts sont enregistrés dans `data/contacts.json` (ignoré par git).

## Back-office (sous-domaine `admin.`)

Identifiants par défaut : **admin / admin**. Changez-les en production en définissant
les variables d'environnement `ADMIN_USER` et `ADMIN_PASSWORD` dans le projet Vercel.

`vercel.json` sert le back-office à la racine de tout hôte commençant par `admin.`.
Pour l'activer, ajoutez le domaine (par ex. `admin.ybcoaching.fr`) dans
*Vercel → Project → Settings → Domains*. Il reste toujours accessible sur `/admin/`
(par ex. https://repogit2.vercel.app/admin/), car un sous-domaine de `*.vercel.app`
n'est pas possible.

### Stockage des contacts

Sur Vercel, le disque des fonctions n'est pas persistant. Installez une base
**Upstash Redis** depuis *Vercel → Storage* (ou le Marketplace) et reliez-la au projet :
les variables `KV_REST_API_URL` / `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`) sont alors détectées automatiquement. Sans elles, un bandeau
dans le back-office signale que le stockage est temporaire.

## Déploiement Vercel

Le site est publié sur https://repogit2.vercel.app par le workflow `.github/workflows/deploy.yml` :

- push sur `master` → déploiement de production ;
- pull request → déploiement de prévisualisation (URL dans le résumé du job).

Un seul secret à créer dans *Settings → Secrets and variables → Actions* :
`VERCEL_TOKEN`, un jeton créé sur https://vercel.com/account/tokens.
Les identifiants de l'équipe et du projet Vercel sont déjà dans le workflow.

Sans `VERCEL_TOKEN`, le workflow se termine sans déployer.
