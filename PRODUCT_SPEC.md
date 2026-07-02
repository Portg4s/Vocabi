# Vocabi Product Spec

## Vision
Vocabi est une application web mobile-first pour apprendre et reviser les bases de l'anglais par sessions courtes, sans compte, sans backend et sans friction. L'app doit etre installee comme PWA sur telephone et fonctionner en local-first.

## Public cible
Utilisateur personnel francophone avec un niveau anglais faible a moyen. Priorite aux bases solides: vocabulaire quotidien, phrases simples, verbes essentiels, comprehension et traduction courte.

## Experience ideale
1. Ouvrir l'app sur telephone.
2. Voir son objectif du jour, son streak, son XP et la prochaine lecon conseillee.
3. Faire une lecon de 3 a 5 minutes.
4. Recevoir un feedback immediat, clair et motivant.
5. Terminer avec un recapitulatif, XP gagne, progression et badge potentiel.

## Boucle d'apprentissage
Dashboard -> choisir une lecon -> enchainer exercices courts -> feedback immediat -> recapitulatif -> progression locale -> retour dashboard.

## Boucle de motivation
Objectif quotidien, XP, streak, badges locaux, progression par unite, celebration sobre en fin de lecon, relance visuelle de la prochaine petite action.

## V1 incluse
- Onboarding local sans compte.
- Objectif quotidien.
- Dashboard mobile.
- Unites et lecons locales.
- Exercices interactifs.
- XP, streak, progression, badges.
- Statistiques/profil local.
- Export/import/reset des donnees locales.
- PWA installable.
- GitHub Pages via static export.

## Hors V1
- Authentification.
- Backend.
- Supabase.
- Prisma.
- API routes obligatoires.
- Server actions.
- Classement multi-utilisateur.
- Audio avance.
- Reconnaissance vocale.
- Generation IA de lecons.
- Backoffice.

## Definition of Done V1
- Utilisable sur mobile depuis l'ecran d'accueil jusqu'a la fin d'une lecon.
- Donnees persistantes localement.
- Build statique compatible GitHub Pages.
- UI coherente, non generique, lisible sur telephone.
- Lint et build passent.
