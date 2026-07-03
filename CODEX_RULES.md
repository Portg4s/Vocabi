# Codex Rules for Vocabi

## Dossier
Toujours travailler dans `D:\app\Vocabi`. Ne jamais creer de dossier parent alternatif.

## Git
- Verifier `git status` avant modification importante.
- Travailler sur `feature/vocabi-v1` pour la V1.
- Ne pas push sans validation explicite.
- Ne pas commit sans expliquer les changements.

## Architecture
- App Router Next.js.
- TypeScript strict.
- Mobile-first.
- Static export compatible GitHub Pages.
- Pas de backend V1.
- Pas de server actions obligatoires.
- Pas d'API routes obligatoires.

## Produit
Relire ces fichiers avant gros changement:
- PRODUCT_SPEC.md
- UI_GUIDELINES.md
- ANIMATION_GUIDELINES.md
- LOCAL_STORAGE_SCHEMA.md
- ROADMAP.md
- DEPLOYMENT.md

## Code
- Composants petits.
- Logique metier separee de l'UI.
- Noms explicites.
- Etats loading/error/empty/success prevus.
- Accessibilite correcte.
- Animations sobres.

## Interdits V1
- Authentification.
- Supabase.
- Prisma.
- Backend obligatoire.
- Vercel obligatoire.
- UI generique.
- Donnees locales chaotiques.
