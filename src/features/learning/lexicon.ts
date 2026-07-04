import { allLessons, units } from "@/data/lessons";
import { getExpectedAnswer, todayKey } from "@/features/learning/scoring";
import type { Exercise, ExerciseHistory, ExerciseMastery, LessonStatus } from "@/types/learning";

export type LexiconStatus = "due" | "fragile" | "steady" | "fresh";

export type LexiconEntry = {
  exercise: Exercise;
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  prompt: string;
  expected: string;
  direction: string;
  status: LexiconStatus;
  masteryLevel: number;
  attempts: number;
  mistakes: number;
  dueAt: string | null;
  lastSeenAt: string | null;
};

export type LexiconSummary = {
  total: number;
  due: number;
  fragile: number;
  steady: number;
  averageMastery: number;
};

export function buildLexiconEntries({
  exerciseMastery,
  exerciseHistory,
  getLessonStatus,
}: {
  exerciseMastery: ExerciseMastery[];
  exerciseHistory: ExerciseHistory[];
  getLessonStatus: (lessonId: string) => LessonStatus;
}) {
  const masteryByExercise = new Map(exerciseMastery.map((item) => [item.exerciseId, item]));
  const historyByExercise = new Map<string, ExerciseHistory[]>();
  const today = todayKey();

  for (const item of exerciseHistory) {
    const current = historyByExercise.get(item.exerciseId) ?? [];
    current.push(item);
    historyByExercise.set(item.exerciseId, current);
  }

  return allLessons
    .flatMap((lesson) => {
      const unit = units.find((item) => item.id === lesson.unitId);
      const lessonStatus = getLessonStatus(lesson.id);
      const lessonVisible = lessonStatus === "available" || lessonStatus === "completed" || lessonStatus === "mastered";

      return lesson.exercises.map((exercise): LexiconEntry | null => {
        const mastery = masteryByExercise.get(exercise.id);
        const history = historyByExercise.get(exercise.id) ?? [];

        if (!lessonVisible && !mastery && history.length === 0) {
          return null;
        }

        const attempts = history.length;
        const mistakes = history.filter((item) => !item.correct).length;
        const masteryLevel = mastery?.masteryLevel ?? 0;
        const status = resolveLexiconStatus({ mastery, attempts, mistakes, today });

        return {
          exercise,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          unitTitle: unit?.title ?? lesson.unitId,
          prompt: exercise.prompt,
          expected: formatAnswer(getExpectedAnswer(exercise)),
          direction: getDirectionLabel(exercise),
          status,
          masteryLevel,
          attempts,
          mistakes,
          dueAt: mastery?.dueAt ?? null,
          lastSeenAt: history.length > 0 ? history[history.length - 1].createdAt : mastery?.lastReviewedAt ?? null,
        };
      });
    })
    .filter((entry): entry is LexiconEntry => entry !== null)
    .sort((left, right) => {
      const statusRank: Record<LexiconStatus, number> = { due: 0, fragile: 1, fresh: 2, steady: 3 };
      if (statusRank[left.status] !== statusRank[right.status]) {
        return statusRank[left.status] - statusRank[right.status];
      }

      return left.prompt.localeCompare(right.prompt, "fr");
    });
}

export function summarizeLexicon(entries: LexiconEntry[]): LexiconSummary {
  const learnedEntries = entries.filter((entry) => entry.attempts > 0 || entry.masteryLevel > 0);
  const averageMastery = learnedEntries.length === 0
    ? 0
    : Math.round(learnedEntries.reduce((sum, entry) => sum + entry.masteryLevel, 0) / learnedEntries.length);

  return {
    total: entries.length,
    due: entries.filter((entry) => entry.status === "due").length,
    fragile: entries.filter((entry) => entry.status === "fragile").length,
    steady: entries.filter((entry) => entry.status === "steady").length,
    averageMastery,
  };
}

function resolveLexiconStatus({
  mastery,
  attempts,
  mistakes,
  today,
}: {
  mastery?: ExerciseMastery;
  attempts: number;
  mistakes: number;
  today: string;
}): LexiconStatus {
  if (mastery && mastery.dueAt <= today) {
    return "due";
  }

  if ((mastery?.masteryLevel ?? 0) >= 85 && attempts > mistakes) {
    return "steady";
  }

  if (mistakes > 0 || (mastery?.masteryLevel ?? 0) < 55) {
    return attempts === 0 ? "fresh" : "fragile";
  }

  return "fresh";
}

function getDirectionLabel(exercise: Exercise) {
  if (exercise.kind === "translate-fr-en") return "FR -> EN";
  if (exercise.kind === "translate-en-fr") return "EN -> FR";
  if (exercise.kind === "fill-blank") return "Phrase";
  if (exercise.kind === "sentence-builder") return "Construction";
  if (exercise.kind === "match-pairs") return "Association";
  return "Quiz";
}

function formatAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(" ") : answer;
}
