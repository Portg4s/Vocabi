import type { BadgeDefinition } from "@/types/learning";

export const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "first-lesson",
    title: "Premier pas",
    description: "Terminer ta première leçon Vocabi.",
    icon: "sparkles",
  },
  {
    id: "daily-goal",
    title: "Objectif tenu",
    description: "Atteindre ton objectif XP du jour.",
    icon: "target",
  },
  {
    id: "three-day-streak",
    title: "Routine lancee",
    description: "Garder une serie de 3 jours.",
    icon: "flame",
  },
  {
    id: "perfect-lesson",
    title: "Sans faute",
    description: "Reussir une leçon avec 100% de bonnes réponses.",
    icon: "trophy",
  },
  {
    id: "unit-starter",
    title: "Explorateur",
    description: "Terminer 3 leçons dans Vocabi.",
    icon: "book",
  },
];

