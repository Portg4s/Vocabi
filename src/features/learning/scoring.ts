import type { Exercise, MatchPairsExercise } from "@/types/learning";

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.!?]/g, "")
    .replace(/\s+/g, " ");
}

export function getExpectedAnswer(exercise: Exercise): string | string[] {
  if (exercise.kind === "sentence-builder") {
    return exercise.answer;
  }

  if (exercise.kind === "match-pairs") {
    return exercise.pairs.map((pair) => `${pair.left}:${pair.right}`);
  }

  return exercise.answer;
}

export function isAnswerCorrect(exercise: Exercise, answer: string | string[]) {
  if (exercise.kind === "sentence-builder") {
    return Array.isArray(answer) && answer.join(" ") === exercise.answer.join(" ");
  }

  if (exercise.kind === "match-pairs") {
    return isMatchPairsCorrect(exercise, answer);
  }

  if (Array.isArray(answer)) {
    return false;
  }

  const accepted = "acceptedAnswers" in exercise && exercise.acceptedAnswers ? exercise.acceptedAnswers : [exercise.answer];
  return accepted.some((acceptedAnswer) => normalize(acceptedAnswer) === normalize(answer));
}

function isMatchPairsCorrect(exercise: MatchPairsExercise, answer: string | string[]) {
  if (!Array.isArray(answer)) {
    return false;
  }

  const expected = new Set(exercise.pairs.map((pair) => `${pair.left}:${pair.right}`));
  return answer.length === expected.size && answer.every((pair) => expected.has(pair));
}

export function calculateLessonScore(total: number, correct: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function calculateEarnedXp(baseXp: number, score: number) {
  const multiplier = score === 100 ? 1.25 : score >= 80 ? 1.1 : 1;
  return Math.round(baseXp * multiplier);
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
