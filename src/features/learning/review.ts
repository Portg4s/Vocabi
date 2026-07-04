import { getExerciseById } from "@/data/lessons";
import { todayKey } from "@/features/learning/scoring";
import type { Exercise, ExerciseMastery } from "@/types/learning";

export type ReviewCandidate = {
  exercise: Exercise;
  mastery: ExerciseMastery;
  overdueDays: number;
};

export type ReviewSummary = {
  dueCount: number;
  weakCount: number;
  masteredCount: number;
  nextDueAt: string | null;
  averageMastery: number;
};

const maxSessionSize = 8;

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return todayKey(date);
}

function daysBetween(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00.000Z`).getTime();
  const toDate = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.round((toDate - fromDate) / 86_400_000));
}

export function scheduleExerciseMastery({
  current,
  lessonId,
  unitId,
  exerciseId,
  correct,
  now = new Date(),
}: {
  current?: ExerciseMastery;
  lessonId: string;
  unitId: string;
  exerciseId: string;
  correct: boolean;
  now?: Date;
}): ExerciseMastery {
  const date = todayKey(now);
  const repetitions = correct ? (current?.repetitions ?? 0) + 1 : 0;
  const easeFactor = correct
    ? Math.min(2.8, (current?.easeFactor ?? 2.1) + 0.1)
    : Math.max(1.3, (current?.easeFactor ?? 2.1) - 0.22);
  const intervalDays = correct ? resolveNextIntervalDays(current, repetitions, easeFactor) : 0;
  const previousMastery = current?.masteryLevel ?? 0;
  const masteryLevel = correct
    ? Math.min(100, previousMastery + 16 + Math.min(12, repetitions * 3))
    : Math.max(0, previousMastery - 24);

  return {
    exerciseId,
    lessonId,
    unitId,
    dueAt: addDays(date, intervalDays),
    lastReviewedAt: date,
    intervalDays,
    easeFactor,
    repetitions,
    lapses: correct ? current?.lapses ?? 0 : (current?.lapses ?? 0) + 1,
    masteryLevel,
    updatedAt: now.toISOString(),
  };
}

function resolveNextIntervalDays(current: ExerciseMastery | undefined, repetitions: number, easeFactor: number) {
  if (repetitions <= 1) {
    return 1;
  }

  if (repetitions === 2) {
    return 3;
  }

  return Math.max(4, Math.round((current?.intervalDays ?? 3) * easeFactor));
}

export function buildReviewQueue(mastery: ExerciseMastery[], today = todayKey(), limit = maxSessionSize): ReviewCandidate[] {
  return mastery
    .filter((item) => item.dueAt <= today)
    .map((item) => {
      const exercise = getExerciseById(item.exerciseId);
      return exercise ? { exercise, mastery: item, overdueDays: daysBetween(item.dueAt, today) } : null;
    })
    .filter((item): item is ReviewCandidate => item !== null)
    .sort((left, right) => {
      if (right.overdueDays !== left.overdueDays) return right.overdueDays - left.overdueDays;
      if (right.mastery.lapses !== left.mastery.lapses) return right.mastery.lapses - left.mastery.lapses;
      return left.mastery.masteryLevel - right.mastery.masteryLevel;
    })
    .slice(0, limit);
}

export function summarizeReview(mastery: ExerciseMastery[], today = todayKey()): ReviewSummary {
  const dueCount = mastery.filter((item) => item.dueAt <= today).length;
  const weakCount = mastery.filter((item) => item.masteryLevel < 55 || item.lapses > 0).length;
  const masteredCount = mastery.filter((item) => item.masteryLevel >= 85 && item.repetitions >= 3).length;
  const futureDueDates = mastery.map((item) => item.dueAt).filter((date) => date > today).sort();
  const averageMastery = mastery.length === 0
    ? 0
    : Math.round(mastery.reduce((sum, item) => sum + item.masteryLevel, 0) / mastery.length);

  return {
    dueCount,
    weakCount,
    masteredCount,
    nextDueAt: futureDueDates[0] ?? null,
    averageMastery,
  };
}
