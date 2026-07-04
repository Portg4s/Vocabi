"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { badgeDefinitions } from "@/data/badges";
import { allLessons } from "@/data/lessons";
import { calculateEarnedXp, calculateLessonScore, getExpectedAnswer, todayKey } from "@/features/learning/scoring";
import { buildReviewQueue, scheduleExerciseMastery, summarizeReview, type ReviewCandidate, type ReviewSummary } from "@/features/learning/review";
import { defaultAudioSettings, type AudioSettings } from "@/features/learning/speech";
import { db, ensureProfile, exportVocabiData, importVocabiData, resetVocabiData } from "@/lib/storage/db";
import type {
  BadgeUnlock,
  DailyStats,
  Exercise,
  ExerciseHistory,
  ExerciseMastery,
  Lesson,
  LessonProgress,
  UserProfile,
} from "@/types/learning";

type CompleteLessonInput = {
  lesson: Lesson;
  answers: Array<{
    exercise: Exercise;
    answer: string | string[];
    correct: boolean;
    durationMs: number;
  }>;
};

export type ProgressSnapshot = {
  profile: UserProfile | null;
  lessonProgress: LessonProgress[];
  exerciseHistory: ExerciseHistory[];
  exerciseMastery: ExerciseMastery[];
  dailyStats: DailyStats[];
  badges: BadgeUnlock[];
  audioSettings: AudioSettings;
  reviewQueue: ReviewCandidate[];
  reviewSummary: ReviewSummary;
  totalXp: number;
  todayXp: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
  totalExercises: number;
  completedLessons: number;
  loading: boolean;
  error: string | null;
};

function createEmptySnapshot(): ProgressSnapshot {
  return {
    profile: null,
    lessonProgress: [],
    exerciseHistory: [],
    exerciseMastery: [],
    dailyStats: [],
    badges: [],
    audioSettings: defaultAudioSettings,
    reviewQueue: [],
    reviewSummary: summarizeReview([]),
    totalXp: 0,
    todayXp: 0,
    streak: 0,
    bestStreak: 0,
    accuracy: 0,
    totalExercises: 0,
    completedLessons: 0,
    loading: true,
    error: null,
  };
}

function calculateStreak(stats: DailyStats[]) {
  const activeDates = new Set(stats.filter((day) => day.xp > 0).map((day) => day.date));
  let streak = 0;
  const cursor = new Date();

  while (activeDates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function calculateBestStreak(stats: DailyStats[]) {
  const dates = stats
    .filter((day) => day.xp > 0)
    .map((day) => day.date)
    .sort();

  if (dates.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(dates[index - 1]);
    const next = new Date(dates[index]);
    previous.setDate(previous.getDate() + 1);

    if (todayKey(previous) === todayKey(next)) {
      current += 1;
      best = Math.max(best, current);
    } else if (dates[index] !== dates[index - 1]) {
      current = 1;
    }
  }

  return best;
}

function resolveBadges({
  score,
  completedLessons,
  todayXp,
  dailyGoalXp,
  streak,
  currentBadges,
}: {
  score: number;
  completedLessons: number;
  todayXp: number;
  dailyGoalXp: number;
  streak: number;
  currentBadges: BadgeUnlock[];
}) {
  const unlocked = new Set(currentBadges.map((badge) => badge.badgeId));
  const next: BadgeUnlock[] = [];
  const now = new Date().toISOString();

  const unlock = (badgeId: string) => {
    if (!unlocked.has(badgeId) && badgeDefinitions.some((badge) => badge.id === badgeId)) {
      next.push({ badgeId, unlockedAt: now, seen: false });
      unlocked.add(badgeId);
    }
  };

  if (completedLessons >= 1) unlock("first-lesson");
  if (completedLessons >= 3) unlock("unit-starter");
  if (todayXp >= dailyGoalXp) unlock("daily-goal");
  if (streak >= 3) unlock("three-day-streak");
  if (score === 100) unlock("perfect-lesson");

  return next;
}

export function useVocabiProgress() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(createEmptySnapshot);

  const refresh = useCallback(async () => {
    try {
      const profile = await ensureProfile();
      const [lessonProgress, exerciseHistory, exerciseMastery, dailyStats, badges, audioSettingsEntry] = await Promise.all([
        db.lessonProgress.toArray(),
        db.exerciseHistory.toArray(),
        db.exerciseMastery.toArray(),
        db.dailyStats.toArray(),
        db.badges.toArray(),
        db.settings.get("audio"),
      ]);
      const totalXp = lessonProgress.reduce((sum, lesson) => sum + lesson.xpEarned, 0);
      const today = dailyStats.find((day) => day.date === todayKey());
      const completedLessons = lessonProgress.filter((lesson) => lesson.status === "completed" || lesson.status === "mastered").length;
      const correctAnswers = dailyStats.reduce((sum, day) => sum + day.correctAnswers, 0);
      const totalAnswers = dailyStats.reduce((sum, day) => sum + day.correctAnswers + day.wrongAnswers, 0);

      setSnapshot({
        profile,
        lessonProgress,
        exerciseHistory,
        exerciseMastery,
        dailyStats,
        badges,
        audioSettings: readAudioSettings(audioSettingsEntry?.value),
        reviewQueue: buildReviewQueue(exerciseMastery),
        reviewSummary: summarizeReview(exerciseMastery),
        totalXp,
        todayXp: today?.xp ?? 0,
        streak: calculateStreak(dailyStats),
        bestStreak: calculateBestStreak(dailyStats),
        accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
        totalExercises: totalAnswers,
        completedLessons,
        loading: false,
        error: null,
      });
    } catch (error) {
      setSnapshot((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Impossible de charger la progression locale.",
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const completeOnboarding = useCallback(async (dailyGoalXp: number) => {
    const profile = await ensureProfile();
    await db.userProfile.put({
      ...profile,
      dailyGoalXp,
      onboardingCompleted: true,
    });
    await refresh();
  }, [refresh]);

  const completeLesson = useCallback(async ({ lesson, answers }: CompleteLessonInput) => {
    const profile = await ensureProfile();
    const correctAnswers = answers.filter((answer) => answer.correct).length;
    const baseXp = answers.reduce((sum, answer) => sum + answer.exercise.xp, 0);
    const score = calculateLessonScore(answers.length, correctAnswers);
    const earnedXp = calculateEarnedXp(baseXp, score);
    const now = new Date().toISOString();
    const date = todayKey();
    const existingLesson = await db.lessonProgress.get(lesson.id);
    const existingDay = await db.dailyStats.get(date);
    const existingMastery = await db.exerciseMastery.bulkGet(answers.map((answer) => answer.exercise.id));
    const history: ExerciseHistory[] = answers.map((answer) => ({
      id: `${lesson.id}-${answer.exercise.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      lessonId: lesson.id,
      exerciseId: answer.exercise.id,
      correct: answer.correct,
      answer: answer.answer,
      expected: getExpectedAnswer(answer.exercise),
      durationMs: answer.durationMs,
      createdAt: now,
    }));

    const nextProgress: LessonProgress = {
      lessonId: lesson.id,
      unitId: lesson.unitId,
      status: score >= 95 ? "mastered" : "completed",
      bestScore: Math.max(existingLesson?.bestScore ?? 0, score),
      attempts: (existingLesson?.attempts ?? 0) + 1,
      xpEarned: (existingLesson?.xpEarned ?? 0) + earnedXp,
      completedAt: now,
      updatedAt: now,
    };

    const nextDay: DailyStats = {
      date,
      xp: (existingDay?.xp ?? 0) + earnedXp,
      lessonsCompleted: (existingDay?.lessonsCompleted ?? 0) + 1,
      exercisesCompleted: (existingDay?.exercisesCompleted ?? 0) + answers.length,
      correctAnswers: (existingDay?.correctAnswers ?? 0) + correctAnswers,
      wrongAnswers: (existingDay?.wrongAnswers ?? 0) + answers.length - correctAnswers,
    };
    const masteryUpdates = answers.map((answer, index) => scheduleExerciseMastery({
      current: existingMastery[index],
      lessonId: existingMastery[index]?.lessonId ?? lesson.id,
      unitId: existingMastery[index]?.unitId ?? lesson.unitId,
      exerciseId: answer.exercise.id,
      correct: answer.correct,
    }));

    await db.transaction("rw", db.lessonProgress, db.dailyStats, db.exerciseHistory, db.exerciseMastery, async () => {
      await db.lessonProgress.put(nextProgress);
      await db.dailyStats.put(nextDay);
      await db.exerciseHistory.bulkPut(history);
      await db.exerciseMastery.bulkPut(masteryUpdates);
    });

    const [allProgress, allDailyStats, currentBadges] = await Promise.all([
      db.lessonProgress.toArray(),
      db.dailyStats.toArray(),
      db.badges.toArray(),
    ]);
    const completedLessons = allProgress.filter((item) => item.status === "completed" || item.status === "mastered").length;
    const streak = calculateStreak(allDailyStats);
    const newBadges = resolveBadges({
      score,
      completedLessons,
      todayXp: nextDay.xp,
      dailyGoalXp: profile.dailyGoalXp,
      streak,
      currentBadges,
    });

    if (newBadges.length > 0) {
      await db.badges.bulkPut(newBadges);
    }

    await refresh();

    return {
      score,
      earnedXp,
      correctAnswers,
      totalAnswers: answers.length,
      newBadges,
    };
  }, [refresh]);

  const completeReviewSession = useCallback(async ({ lesson, answers }: CompleteLessonInput) => {
    const profile = await ensureProfile();
    const correctAnswers = answers.filter((answer) => answer.correct).length;
    const baseXp = answers.reduce((sum, answer) => sum + Math.max(4, Math.round(answer.exercise.xp * 0.65)), 0);
    const score = calculateLessonScore(answers.length, correctAnswers);
    const earnedXp = calculateEarnedXp(baseXp, score);
    const now = new Date().toISOString();
    const date = todayKey();
    const existingDay = await db.dailyStats.get(date);
    const existingMastery = await db.exerciseMastery.bulkGet(answers.map((answer) => answer.exercise.id));
    const history: ExerciseHistory[] = answers.map((answer) => ({
      id: `${lesson.id}-${answer.exercise.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      lessonId: lesson.id,
      exerciseId: answer.exercise.id,
      correct: answer.correct,
      answer: answer.answer,
      expected: getExpectedAnswer(answer.exercise),
      durationMs: answer.durationMs,
      createdAt: now,
    }));
    const nextDay: DailyStats = {
      date,
      xp: (existingDay?.xp ?? 0) + earnedXp,
      lessonsCompleted: existingDay?.lessonsCompleted ?? 0,
      exercisesCompleted: (existingDay?.exercisesCompleted ?? 0) + answers.length,
      correctAnswers: (existingDay?.correctAnswers ?? 0) + correctAnswers,
      wrongAnswers: (existingDay?.wrongAnswers ?? 0) + answers.length - correctAnswers,
    };
    const masteryUpdates = answers.map((answer, index) => scheduleExerciseMastery({
      current: existingMastery[index],
      lessonId: existingMastery[index]?.lessonId ?? lesson.id,
      unitId: existingMastery[index]?.unitId ?? lesson.unitId,
      exerciseId: answer.exercise.id,
      correct: answer.correct,
    }));

    await db.transaction("rw", db.dailyStats, db.exerciseHistory, db.exerciseMastery, async () => {
      await db.dailyStats.put(nextDay);
      await db.exerciseHistory.bulkPut(history);
      await db.exerciseMastery.bulkPut(masteryUpdates);
    });

    const [allProgress, allDailyStats, currentBadges] = await Promise.all([
      db.lessonProgress.toArray(),
      db.dailyStats.toArray(),
      db.badges.toArray(),
    ]);
    const completedLessons = allProgress.filter((item) => item.status === "completed" || item.status === "mastered").length;
    const streak = calculateStreak(allDailyStats);
    const newBadges = resolveBadges({
      score,
      completedLessons,
      todayXp: nextDay.xp,
      dailyGoalXp: profile.dailyGoalXp,
      streak,
      currentBadges,
    });

    if (newBadges.length > 0) {
      await db.badges.bulkPut(newBadges);
    }

    await refresh();

    return {
      score,
      earnedXp,
      correctAnswers,
      totalAnswers: answers.length,
      newBadges,
    };
  }, [refresh]);

  const getLessonStatus = useCallback((lessonId: string) => {
    const index = allLessons.findIndex((lesson) => lesson.id === lessonId);
    if (index === 0) return "available";

    const progress = snapshot.lessonProgress.find((lesson) => lesson.lessonId === lessonId);
    if (progress) return progress.status;

    const previousLesson = allLessons[index - 1];
    const previousProgress = snapshot.lessonProgress.find((lesson) => lesson.lessonId === previousLesson?.id);
    return previousProgress?.status === "completed" || previousProgress?.status === "mastered" ? "available" : "locked";
  }, [snapshot.lessonProgress]);

  const resetData = useCallback(async () => {
    await resetVocabiData();
    await refresh();
  }, [refresh]);

  const exportData = useCallback(async () => exportVocabiData(), []);

  const importData = useCallback(async (data: unknown) => {
    await importVocabiData(data);
    await refresh();
  }, [refresh]);

  const updateDailyGoal = useCallback(async (dailyGoalXp: number) => {
    const profile = await ensureProfile();
    await db.userProfile.put({
      ...profile,
      dailyGoalXp,
    });
    await refresh();
  }, [refresh]);

  const updateAudioSettings = useCallback(async (audioSettings: AudioSettings) => {
    await db.settings.put({
      key: "audio",
      value: audioSettings,
      updatedAt: new Date().toISOString(),
    });
    await refresh();
  }, [refresh]);

  return useMemo(() => ({
    ...snapshot,
    completeOnboarding,
    updateDailyGoal,
    completeLesson,
    completeReviewSession,
    updateAudioSettings,
    getLessonStatus,
    resetData,
    exportData,
    importData,
    refresh,
  }), [completeLesson, completeOnboarding, completeReviewSession, exportData, getLessonStatus, importData, refresh, resetData, snapshot, updateAudioSettings, updateDailyGoal]);
}

function readAudioSettings(value: unknown): AudioSettings {
  if (typeof value !== "object" || value === null) {
    return defaultAudioSettings;
  }

  const settings = value as Partial<AudioSettings>;

  return {
    autoSpeak: settings.autoSpeak ?? defaultAudioSettings.autoSpeak,
    slowMode: settings.slowMode ?? defaultAudioSettings.slowMode,
  };
}
