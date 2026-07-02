# Vocabi Local Storage Schema

## Strategie
Stockage principal: IndexedDB via Dexie.js. `localStorage` peut seulement servir pour de tres petites preferences si necessaire, mais la progression doit rester dans IndexedDB.

## Objectifs
- Donnees locales fiables.
- Schema versionne.
- Export/import JSON.
- Reset local volontaire.
- Aucune dependance serveur.

## Tables proposees

### userProfile
- id: string
- displayName?: string
- createdAt: string
- onboardingCompleted: boolean
- dailyGoalXp: number
- preferredSessionLength: number

### lessonProgress
- lessonId: string
- unitId: string
- status: locked | available | completed | mastered
- bestScore: number
- attempts: number
- xpEarned: number
- completedAt?: string
- updatedAt: string

### exerciseHistory
- id: string
- lessonId: string
- exerciseId: string
- correct: boolean
- answer: string | string[]
- expected: string | string[]
- durationMs: number
- createdAt: string

### dailyStats
- date: string
- xp: number
- lessonsCompleted: number
- exercisesCompleted: number
- correctAnswers: number
- wrongAnswers: number

### badges
- badgeId: string
- unlockedAt: string
- seen: boolean

### settings
- key: string
- value: unknown
- updatedAt: string

### meta
- key: string
- value: unknown

## Protection contre la perte
- Export JSON manuel depuis l'ecran profil/reglages.
- Import JSON avec validation de version.
- Migrations Dexie versionnees.
- Reset avec confirmation explicite.

## Streak
Le streak est calcule depuis `dailyStats`, puis eventuellement mis en cache. Source de verite: dates d'activite locale.
