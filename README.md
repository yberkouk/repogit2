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

Un seul secret à créer dans *Settings → Secrets and variables → Actions* :
`VERCEL_TOKEN`, un jeton créé sur https://vercel.com/account/tokens.
Les identifiants de l'équipe et du projet Vercel sont déjà dans le workflow.

Sans `VERCEL_TOKEN`, le workflow se termine sans déployer.
