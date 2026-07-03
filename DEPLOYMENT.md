# Vocabi Deployment

## Cible
GitHub Pages via GitHub Actions. Pas de dependance obligatoire a Vercel.

## Contraintes Next.js static export
- Utiliser `output: "export"`.
- Eviter server actions.
- Eviter API routes obligatoires.
- Eviter logique serveur dynamique.
- Prudence avec `next/image`; preferer images statiques simples ou `unoptimized` si necessaire.

## Repo GitHub
Repo: `https://github.com/Portg4s/Vocabi.git`
Nom repo: `Vocabi`
URL probable GitHub Pages: `https://portg4s.github.io/Vocabi/`

## Base path
Pour GitHub Pages en repo project, configurer probablement:
- `basePath: "/Vocabi"` en production GitHub Pages.
- `assetPrefix: "/Vocabi/"` en production GitHub Pages.

En local, ne pas imposer le basePath pour garder `localhost:3000` simple.

## Build attendu
- `npm run lint`
- `npm run build`

Avec `output: "export"`, Next genere le dossier `out`.

## GitHub Actions
Workflow cible:
- checkout
- setup-node
- npm ci
- npm run lint
- npm run build
- upload artifact `out`
- deploy-pages

## PWA
- Manifest dans `public` ou via metadata Next selon compatibilite export.
- Service worker simple dans `public/sw.js`.
- Enregistrer le service worker cote client.
- Verifier chemins avec basePath GitHub Pages.
