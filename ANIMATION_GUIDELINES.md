# Vocabi Animation Guidelines

## Objectif
Les animations doivent renforcer l'apprentissage: feedback, progression, motivation et comprehension d'etat. Elles ne doivent jamais fatiguer ni ralentir l'utilisateur.

## Bibliotheque
Utiliser Motion for React pour les animations d'interface. Centraliser les variants reutilisables dans `src/lib/animations`.

## Animations V1
- Apparition douce des cartes.
- Transition entre questions.
- Shake leger sur erreur.
- Pulse/glow sur reussite.
- Progression animee de la barre de lecon.
- XP qui compte ou progresse visuellement.
- Badge debloque avec scale doux.
- Skeletons/loading states animes.
- Micro-interactions sur boutons.

## Contraintes
- Respecter `prefers-reduced-motion`.
- Preferer transform et opacity.
- Eviter les grandes animations de layout couteuses.
- Durees courtes: 120ms a 450ms selon contexte.
- Les celebrations restent sobres.

## Patterns
- Entree carte: opacity 0 -> 1, y 12 -> 0.
- Bonne reponse: scale leger + halo vert.
- Mauvaise reponse: x shake court + feedback corail.
- Changement question: sortie rapide, entree claire.

## Definition of Done animation
Chaque animation doit aider a comprendre ce qui se passe. Si elle est seulement decorative, elle doit etre supprimee ou reduite.
