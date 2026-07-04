export type ExerciseKind =
  | "translate-fr-en"
  | "translate-en-fr"
  | "multiple-choice"
  | "fill-blank"
  | "sentence-builder"
  | "match-pairs"
  | "review-quiz";

export type ExerciseBase = {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  instruction: string;
  xp: number;
  hint?: string;
};

export type TextExercise = ExerciseBase & {
  kind: "translate-fr-en" | "translate-en-fr" | "fill-blank";
  answer: string;
  acceptedAnswers?: string[];
};

export type ChoiceExercise = ExerciseBase & {
  kind: "multiple-choice" | "review-quiz";
  options: string[];
  answer: string;
};

export type SentenceBuilderExercise = ExerciseBase & {
  kind: "sentence-builder";
  tokens: string[];
  answer: string[];
};

export type MatchPairsExercise = ExerciseBase & {
  kind: "match-pairs";
  pairs: Array<{ left: string; right: string }>;
};

export type Exercise =
  | TextExercise
  | ChoiceExercise
  | SentenceBuilderExercise
  | MatchPairsExercise;

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: "A1" | "A2";
  exercises: Exercise[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  color: "mint" | "sky" | "sun" | "coral";
  lessons: Lesson[];
};

export type LessonStatus = "locked" | "available" | "completed" | "mastered";

export type LessonProgress = {
  lessonId: string;
  unitId: string;
  status: LessonStatus;
  bestScore: number;
  attempts: number;
  xpEarned: number;
  completedAt?: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  displayName?: string;
  createdAt: string;
  onboardingCompleted: boolean;
  dailyGoalXp: number;
  preferredSessionLength: number;
};

export type ExerciseHistory = {
  id: string;
  lessonId: string;
  exerciseId: string;
  correct: boolean;
  answer: string | string[];
  expected: string | string[];
  durationMs: number;
  createdAt: string;
};

export type ExerciseMastery = {
  exerciseId: string;
  lessonId: string;
  unitId: string;
  dueAt: string;
  lastReviewedAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  masteryLevel: number;
  updatedAt: string;
};

export type DailyStats = {
  date: string;
  xp: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export type BadgeUnlock = {
  badgeId: string;
  unlockedAt: string;
  seen: boolean;
};

export type BadgeDefinition = {
  id: string;
  title: string;
  description: string;
  icon: "sparkles" | "flame" | "target" | "trophy" | "book";
};
