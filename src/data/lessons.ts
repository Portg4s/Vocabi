import type { Unit } from "@/types/learning";

export const units: Unit[] = [
  {
    id: "basics-1",
    title: "Bases essentielles",
    description: "Saluer, se présenter et reconnaître les premières phrases utiles.",
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
            instruction: "Complète la phrase.",
            answer: "am",
            acceptedAnswers: ["am"],
            xp: 10,
          },
          {
            id: "hello-5",
            kind: "review-quiz",
            prompt: "See you soon",
            instruction: "Choisis le sens de cette expression.",
            options: ["À bientôt", "Bonne nuit", "Je suis désolé", "Merci beaucoup"],
            answer: "À bientôt",
            xp: 8,
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
            options: ["S'il te plaît", "Pardon", "À bientôt", "Je vais bien"],
            answer: "S'il te plaît",
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
              { left: "café", right: "coffee" },
            ],
            xp: 15,
          },
          {
            id: "needs-4",
            kind: "review-quiz",
            prompt: "How are you?",
            instruction: "Que veut dire cette question ?",
            options: ["Comment ça va ?", "Où es-tu ?", "Qui es-tu ?", "Quel âge as-tu ?"],
            answer: "Comment ça va ?",
            xp: 10,
          },
          {
            id: "needs-5",
            kind: "fill-blank",
            prompt: "Can I have water, ___?",
            instruction: "Complète avec le mot poli.",
            answer: "please",
            acceptedAnswers: ["please"],
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
        title: "À la maison",
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
            prompt: "Je suis à la maison",
            instruction: "Reconstitue la phrase.",
            tokens: ["I", "am", "at", "home", "in", "house"],
            answer: ["I", "am", "at", "home"],
            xp: 12,
          },
          {
            id: "home-4",
            kind: "match-pairs",
            prompt: "Associe les objets.",
            instruction: "Trouve les paires de vocabulaire.",
            pairs: [
              { left: "chaise", right: "chair" },
              { left: "table", right: "table" },
              { left: "lit", right: "bed" },
            ],
            xp: 15,
          },
        ],
      },
      {
        id: "daily-actions",
        unitId: "daily-life",
        title: "Actions du quotidien",
        description: "Comprendre les verbes simples pour parler de sa journée.",
        estimatedMinutes: 5,
        difficulty: "A1",
        exercises: [
          {
            id: "actions-1",
            kind: "multiple-choice",
            prompt: "I eat",
            instruction: "Choisis la bonne traduction.",
            options: ["Je mange", "Je bois", "Je dors", "Je lis"],
            answer: "Je mange",
            xp: 8,
          },
          {
            id: "actions-2",
            kind: "translate-fr-en",
            prompt: "Je bois de l'eau",
            instruction: "Traduis en anglais.",
            answer: "i drink water",
            acceptedAnswers: ["i drink water", "i drink some water"],
            xp: 12,
          },
          {
            id: "actions-3",
            kind: "fill-blank",
            prompt: "She ___ a book.",
            instruction: "Complète avec le verbe lire.",
            answer: "reads",
            acceptedAnswers: ["reads"],
            xp: 12,
            hint: "Avec he/she/it, on ajoute souvent un s au présent simple.",
          },
          {
            id: "actions-4",
            kind: "sentence-builder",
            prompt: "Nous travaillons aujourd'hui",
            instruction: "Reconstitue la phrase.",
            tokens: ["We", "work", "today", "are", "working"],
            answer: ["We", "work", "today"],
            xp: 12,
          },
        ],
      },
    ],
  },
  {
    id: "travel-a1",
    title: "Voyage facile",
    description: "Se débrouiller avec des phrases très simples en déplacement.",
    color: "sun",
    lessons: [
      {
        id: "directions",
        unitId: "travel-a1",
        title: "Se repérer",
        description: "Demander son chemin et comprendre les directions simples.",
        estimatedMinutes: 5,
        difficulty: "A2",
        exercises: [
          {
            id: "directions-1",
            kind: "translate-fr-en",
            prompt: "Où est la gare ?",
            instruction: "Traduis en anglais.",
            answer: "where is the train station",
            acceptedAnswers: ["where is the train station", "where is the station"],
            xp: 14,
          },
          {
            id: "directions-2",
            kind: "multiple-choice",
            prompt: "Turn left",
            instruction: "Choisis la bonne traduction.",
            options: ["Tournez à gauche", "Tournez à droite", "Allez tout droit", "Arrêtez-vous"],
            answer: "Tournez à gauche",
            xp: 10,
          },
          {
            id: "directions-3",
            kind: "match-pairs",
            prompt: "Associe les directions.",
            instruction: "Relie chaque mot à son sens.",
            pairs: [
              { left: "left", right: "gauche" },
              { left: "right", right: "droite" },
              { left: "straight", right: "tout droit" },
            ],
            xp: 15,
          },
          {
            id: "directions-4",
            kind: "sentence-builder",
            prompt: "La banque est à droite",
            instruction: "Reconstitue la phrase.",
            tokens: ["The", "bank", "is", "on", "the", "right", "left"],
            answer: ["The", "bank", "is", "on", "the", "right"],
            xp: 14,
          },
        ],
      },
      {
        id: "hotel-checkin",
        unitId: "travel-a1",
        title: "À l'hôtel",
        description: "Phrases utiles pour arriver à l'hôtel et demander de l'aide.",
        estimatedMinutes: 5,
        difficulty: "A2",
        exercises: [
          {
            id: "hotel-1",
            kind: "multiple-choice",
            prompt: "I have a reservation",
            instruction: "Choisis la bonne traduction.",
            options: ["J'ai une réservation", "Je veux payer", "Je suis perdu", "J'ai faim"],
            answer: "J'ai une réservation",
            xp: 10,
          },
          {
            id: "hotel-2",
            kind: "fill-blank",
            prompt: "Can you help ___?",
            instruction: "Complète la phrase.",
            answer: "me",
            acceptedAnswers: ["me"],
            xp: 10,
          },
          {
            id: "hotel-3",
            kind: "translate-fr-en",
            prompt: "La chambre est propre",
            instruction: "Traduis en anglais.",
            answer: "the room is clean",
            acceptedAnswers: ["the room is clean"],
            xp: 12,
          },
          {
            id: "hotel-4",
            kind: "review-quiz",
            prompt: "Key",
            instruction: "Choisis la bonne traduction.",
            options: ["Clé", "Lit", "Douche", "Fenêtre"],
            answer: "Clé",
            xp: 8,
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

export function getExerciseById(exerciseId: string) {
  for (const lesson of allLessons) {
    const exercise = lesson.exercises.find((item) => item.id === exerciseId);

    if (exercise) {
      return exercise;
    }
  }

  return undefined;
}
