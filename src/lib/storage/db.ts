"use client";

import Dexie, { type Table } from "dexie";
import type {
  BadgeUnlock,
  DailyStats,
  ExerciseHistory,
  LessonProgress,
  UserProfile,
} from "@/types/learning";

export type SettingEntry = {
  key: string;
  value: unknown;
  updatedAt: string;
};

export type MetaEntry = {
  key: string;
  value: unknown;
};

export class VocabiDatabase extends Dexie {
  userProfile!: Table<UserProfile, string>;
  lessonProgress!: Table<LessonProgress, string>;
  exerciseHistory!: Table<ExerciseHistory, string>;
  dailyStats!: Table<DailyStats, string>;
  badges!: Table<BadgeUnlock, string>;
  settings!: Table<SettingEntry, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super("vocabi-local-db");

    this.version(1).stores({
      userProfile: "id",
      lessonProgress: "lessonId, unitId, status, updatedAt",
      exerciseHistory: "id, lessonId, exerciseId, createdAt",
      dailyStats: "date",
      badges: "badgeId, unlockedAt, seen",
      settings: "key",
      meta: "key",
    });
  }
}

export const db = new VocabiDatabase();

export const defaultProfile: UserProfile = {
  id: "local-user",
  createdAt: new Date().toISOString(),
  onboardingCompleted: false,
  dailyGoalXp: 30,
  preferredSessionLength: 5,
};

export async function ensureProfile() {
  const existing = await db.userProfile.get("local-user");

  if (existing) {
    return existing;
  }

  await db.userProfile.put(defaultProfile);
  return defaultProfile;
}

export async function exportVocabiData() {
  const [userProfile, lessonProgress, exerciseHistory, dailyStats, badges, settings, meta] = await Promise.all([
    db.userProfile.toArray(),
    db.lessonProgress.toArray(),
    db.exerciseHistory.toArray(),
    db.dailyStats.toArray(),
    db.badges.toArray(),
    db.settings.toArray(),
    db.meta.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userProfile,
    lessonProgress,
    exerciseHistory,
    dailyStats,
    badges,
    settings,
    meta,
  };
}

export async function resetVocabiData() {
  await db.transaction("rw", [db.userProfile, db.lessonProgress, db.exerciseHistory, db.dailyStats, db.badges, db.settings, db.meta], async () => {
    await Promise.all([
      db.userProfile.clear(),
      db.lessonProgress.clear(),
      db.exerciseHistory.clear(),
      db.dailyStats.clear(),
      db.badges.clear(),
      db.settings.clear(),
      db.meta.clear(),
    ]);

    await db.userProfile.put({ ...defaultProfile, createdAt: new Date().toISOString() });
  });
}

