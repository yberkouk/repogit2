# repogit2

Landing page « site vitrine » pour un Coach Agile (HTML/CSS/JS statiques, sans dépendance).

- `index.html` : structure de la page (hero, services, approche, résultats, témoignages, contact)
- `style.css` : styles, responsive et mode sombre automatique
- `chart.js` : graphique interactif vélocité / lead time en SVG

Ouvrir `index.html` dans un navigateur, ou activer GitHub Pages sur la branche.

## Déploiement Vercel

Le site est publié sur https://repogit2.vercel.app par le workflow `.github/workflows/deploy.yml` :

- push sur `master` → déploiement de production ;
- pull request → déploiement de prévisualisation (URL dans le résumé du job).

Secrets à créer dans *Settings → Secrets and variables → Actions* :

| Secret | Valeur |
| --- | --- |
| `VERCEL_TOKEN` | jeton créé sur https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `team_o738YikXsBRKVERqQuCJnq1a` |
| `VERCEL_PROJECT_ID` | `prj_g0yx4Kbsqk4fE8EcaAde1ik738dD` |

Sans `VERCEL_TOKEN`, le workflow se termine sans déployer.
