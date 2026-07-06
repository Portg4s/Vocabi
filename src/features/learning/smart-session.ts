import { allLessons, getExerciseById } from "@/data/lessons";
import { todayKey } from "@/features/learning/scoring";
import type { ReviewCandidate } from "@/features/learning/review";
import type { Exercise, ExerciseHistory, Lesson, LessonStatus } from "@/types/learning";

type BuildSessionInput = {
  reviewQueue: ReviewCandidate[];
  exerciseHistory: ExerciseHistory[];
  getLessonStatus: (lessonId: string) => LessonStatus;
  limit?: number;
};

const defaultSessionLimit = 8;

export function buildSmartSession({
  reviewQueue,
  exerciseHistory,
  getLessonStatus,
  limit = defaultSessionLimit,
}: BuildSessionInput): Lesson | null {
  const reviewExercises = reviewQueue.map((item) => item.exercise);
  const mistakeExercises = getRecentMistakeExercises(exerciseHistory);
  const nextLesson = allLessons.find((lesson) => getLessonStatus(lesson.id) === "available") ?? allLessons[0];
  const newExercises = nextLesson?.exercises ?? [];
  const exercises = uniqueExercises([...reviewExercises, ...mistakeExercises, ...newExercises]).slice(0, limit);

  return createPracticeLesson({
    id: `smart-${todayKey()}`,
    title: "Session 5 min",
    description: "Un mix court entre révision, erreurs récentes et prochain contenu utile.",
    exercises,
  });
}

export function buildMistakeSession(exerciseHistory: ExerciseHistory[], limit = defaultSessionLimit): Lesson | null {
  return createPracticeLesson({
    id: `mistakes-${todayKey()}`,
    title: "Mes erreurs",
    description: "Une session ciblée pour reprendre les réponses qui ont accroché récemment.",
    exercises: getRecentMistakeExercises(exerciseHistory).slice(0, limit),
  });
}

export function getRecentMistakeExercises(exerciseHistory: ExerciseHistory[]) {
  const mistakes = exerciseHistory.filter((item) => !item.correct).slice().reverse();
  const exercises: Exercise[] = [];
  const seen = new Set<string>();

  for (const item of mistakes) {
    if (seen.has(item.exerciseId)) {
      continue;
    }

    const exercise = getExerciseById(item.exerciseId);

    if (exercise) {
      exercises.push(exercise);
      seen.add(item.exerciseId);
    }
  }

  return exercises;
}

function uniqueExercises(exercises: Exercise[]) {
  const seen = new Set<string>();
  const unique: Exercise[] = [];

  for (const exercise of exercises) {
    if (!seen.has(exercise.id)) {
      unique.push(exercise);
      seen.add(exercise.id);
    }
  }

  return unique;
}

function createPracticeLesson({
  id,
  title,
  description,
  exercises,
}: {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}): Lesson | null {
  if (exercises.length === 0) {
    return null;
  }

  return {
    id,
    unitId: "practice",
    title,
    description,
    estimatedMinutes: Math.max(2, Math.ceil(exercises.length * 0.7)),
    difficulty: exercises.some((exercise) => getExerciseDifficulty(exercise.id) === "A2") ? "A2" : "A1",
    exercises,
  };
}

function getExerciseDifficulty(exerciseId: string) {
  return allLessons.find((lesson) => lesson.exercises.some((exercise) => exercise.id === exerciseId))?.difficulty ?? "A1";
}
