import test from "node:test";
import assert from "node:assert/strict";
import { allLessons } from "../src/data/lessons.ts";
import { calculateEarnedXp, calculateLessonScore, isAnswerCorrect } from "../src/features/learning/scoring.ts";
import { buildReviewQueue, scheduleExerciseMastery, summarizeReview } from "../src/features/learning/review.ts";
import { buildMistakeSession, buildSmartSession } from "../src/features/learning/smart-session.ts";
import { parseVocabiBackup } from "../src/lib/storage/db.ts";
import type { ExerciseHistory, LessonStatus } from "../src/types/learning.ts";

test("scoring accepts accents, punctuation and configured variants", () => {
  const lesson = allLessons.find((item) => item.id === "simple-needs");
  const exercise = lesson?.exercises.find((item) => item.id === "needs-2");

  assert.ok(exercise);
  assert.equal(isAnswerCorrect(exercise, "S'il te plaît!"), true);
  assert.equal(isAnswerCorrect(exercise, "À bientôt"), false);
  assert.equal(calculateLessonScore(5, 4), 80);
  assert.equal(calculateEarnedXp(50, 100), 63);
  assert.equal(calculateEarnedXp(50, 80), 55);
});

test("review scheduling prioritizes due weak cards", () => {
  const missed = scheduleExerciseMastery({
    lessonId: "hello-start",
    unitId: "basics-1",
    exerciseId: "hello-1",
    correct: false,
    now: new Date("2026-07-06T08:00:00.000Z"),
  });
  const learned = scheduleExerciseMastery({
    lessonId: "simple-needs",
    unitId: "basics-1",
    exerciseId: "needs-1",
    correct: true,
    now: new Date("2026-07-06T08:00:00.000Z"),
  });
  const queue = buildReviewQueue([learned, missed], "2026-07-06");
  const summary = summarizeReview([learned, missed], "2026-07-06");

  assert.equal(queue[0].exercise.id, "hello-1");
  assert.equal(summary.dueCount, 1);
  assert.equal(summary.weakCount, 2);
});

test("smart sessions mix due review, mistakes and next available content without duplicates", () => {
  const reviewMastery = scheduleExerciseMastery({
    lessonId: "hello-start",
    unitId: "basics-1",
    exerciseId: "hello-1",
    correct: false,
    now: new Date("2026-07-06T08:00:00.000Z"),
  });
  const reviewQueue = buildReviewQueue([reviewMastery], "2026-07-06");
  const history: ExerciseHistory[] = [
    {
      id: "history-1",
      lessonId: "simple-needs",
      exerciseId: "needs-1",
      correct: false,
      answer: "merci",
      expected: "thank you",
      durationMs: 1200,
      createdAt: "2026-07-06T08:00:00.000Z",
    },
  ];
  const getLessonStatus = (lessonId: string): LessonStatus => (lessonId === "home-words" ? "available" : "completed");
  const smartSession = buildSmartSession({ reviewQueue, exerciseHistory: history, getLessonStatus, limit: 5 });
  const mistakeSession = buildMistakeSession(history);

  assert.ok(smartSession);
  assert.deepEqual(smartSession.exercises.map((exercise) => exercise.id).slice(0, 3), ["hello-1", "needs-1", "home-1"]);
  assert.equal(new Set(smartSession.exercises.map((exercise) => exercise.id)).size, smartSession.exercises.length);
  assert.equal(mistakeSession?.title, "Mes erreurs");
  assert.deepEqual(mistakeSession?.exercises.map((exercise) => exercise.id), ["needs-1"]);
});

test("backup parsing rejects unsupported or corrupted local data", () => {
  const backup = parseVocabiBackup({
    version: 1,
    exportedAt: "2026-07-06T08:00:00.000Z",
    userProfile: [],
    lessonProgress: [],
    exerciseHistory: [],
    exerciseMastery: [],
    dailyStats: [],
    badges: [],
    settings: [],
    meta: [],
  });

  assert.equal(backup.version, 1);
  assert.throws(() => parseVocabiBackup({ version: 2, exportedAt: "2026-07-06T08:00:00.000Z" }), /version non supportée/);
  assert.throws(
    () => parseVocabiBackup({ version: 1, exportedAt: "2026-07-06T08:00:00.000Z", lessonProgress: "broken" }),
    /champ lessonProgress invalide/,
  );
  assert.throws(() => parseVocabiBackup({ version: 1, lessonProgress: [] }), /date d'export manquante/);
});
