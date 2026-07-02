import type { Unit } from "@/types/learning";

export const units: Unit[] = [
  {
    id: "basics-1",
    title: "Bases essentielles",
    description: "Saluer, se presenter et reconnaitre les phrases simples.",
    color: "mint",
    lessons: [
      {
        id: "hello-start",
        unitId: "basics-1",
        title: "Dire bonjour",
        description: "Les salutations et les premières phrases utiles.",
        estimatedMinutes: 4,
        difficulty: "A1",
        exercises: [
          {
            id: "hello-1",
            kind: "multiple-choice",
            prompt: "Bonjour",
            instruction: "Choisis la bonne traduction.",
            options: ["Hello", "Good night", "Please", "Sorry"],
            answer: "Hello",
            xp: 8,
          },
          {
            id: "hello-2",
            kind: "translate-en-fr",
            prompt: "Good morning",
            instruction: "Traduis en français.",
            answer: "bonjour",
            acceptedAnswers: ["bonjour", "bon matin"],
            xp: 10,
            hint: "On le dit surtout le matin.",
          },
          {
            id: "hello-3",
            kind: "sentence-builder",
            prompt: "Je suis Bastien",
            instruction: "Reconstitue la phrase en anglais.",
            tokens: ["I", "am", "Bastien", "you", "are"],
            answer: ["I", "am", "Bastien"],
            xp: 12,
          },
          {
            id: "hello-4",
            kind: "fill-blank",
            prompt: "I ___ fine.",
            instruction: "Complete la phrase.",
            answer: "am",
            acceptedAnswers: ["am"],
            xp: 10,
          },
        ],
      },
      {
        id: "simple-needs",
        unitId: "basics-1",
        title: "Besoins simples",
        description: "Demander, remercier et comprendre les mots de base.",
        estimatedMinutes: 5,
        difficulty: "A1",
        exercises: [
          {
            id: "needs-1",
            kind: "translate-fr-en",
            prompt: "Merci",
            instruction: "Traduis en anglais.",
            answer: "thank you",
            acceptedAnswers: ["thank you", "thanks"],
            xp: 10,
          },
          {
            id: "needs-2",
            kind: "multiple-choice",
            prompt: "Please",
            instruction: "Choisis la bonne traduction.",
            options: ["S'il te plait", "Pardon", "A bientot", "Je vais bien"],
            answer: "S'il te plait",
            xp: 8,
          },
          {
            id: "needs-3",
            kind: "match-pairs",
            prompt: "Associe les mots.",
            instruction: "Trouve chaque paire français / anglais.",
            pairs: [
              { left: "eau", right: "water" },
              { left: "pain", right: "bread" },
              { left: "cafe", right: "coffee" },
            ],
            xp: 15,
          },
          {
            id: "needs-4",
            kind: "review-quiz",
            prompt: "How are you?",
            instruction: "Que veut dire cette question ?",
            options: ["Comment ca va ?", "Ou es-tu ?", "Qui es-tu ?", "Quel age as-tu ?"],
            answer: "Comment ca va ?",
            xp: 10,
          },
        ],
      },
    ],
  },
  {
    id: "daily-life",
    title: "Vie quotidienne",
    description: "Objets, actions et mini phrases pour tous les jours.",
    color: "sky",
    lessons: [
      {
        id: "home-words",
        unitId: "daily-life",
        title: "A la maison",
        description: "Apprendre les mots utiles autour de la maison.",
        estimatedMinutes: 4,
        difficulty: "A1",
        exercises: [
          {
            id: "home-1",
            kind: "multiple-choice",
            prompt: "House",
            instruction: "Choisis la bonne traduction.",
            options: ["Maison", "Voiture", "Rue", "Ville"],
            answer: "Maison",
            xp: 8,
          },
          {
            id: "home-2",
            kind: "translate-fr-en",
            prompt: "une porte",
            instruction: "Traduis en anglais.",
            answer: "a door",
            acceptedAnswers: ["a door", "door"],
            xp: 10,
          },
          {
            id: "home-3",
            kind: "sentence-builder",
            prompt: "Je suis a la maison",
            instruction: "Reconstitue la phrase.",
            tokens: ["I", "am", "at", "home", "in", "house"],
            answer: ["I", "am", "at", "home"],
            xp: 12,
          },
        ],
      },
    ],
  },
];

export const allLessons = units.flatMap((unit) => unit.lessons);

export function getLessonById(lessonId: string) {
  return allLessons.find((lesson) => lesson.id === lessonId);
}

export function getFirstLesson() {
  return allLessons[0];
}

