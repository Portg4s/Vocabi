"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  Brain,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Layers3,
  LibraryBig,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { badgeDefinitions } from "@/data/badges";
import { allLessons, getExerciseById, getFirstLesson, units } from "@/data/lessons";
import { errorShake, feedbackVariants, glintSweep, pageVariants, pressable, revealContainer, revealItem, slowHalo, successPulse } from "@/lib/animations/variants";
import { Button } from "@/components/ui/button";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getExpectedAnswer, isAnswerCorrect, todayKey } from "@/features/learning/scoring";
import { buildLexiconEntries, summarizeLexicon, type LexiconEntry, type LexiconStatus } from "@/features/learning/lexicon";
import type { ReviewCandidate } from "@/features/learning/review";
import { getExerciseSpeechTarget, speakEnglish, type AudioSettings } from "@/features/learning/speech";
import { buildMistakeSession, buildSmartSession } from "@/features/learning/smart-session";
import { useVocabiProgress } from "@/hooks/use-vocabi-progress";
import { cn } from "@/lib/utils";
import type { Exercise, Lesson } from "@/types/learning";

type Tab = "home" | "lessons" | "stats" | "profile";
type LessonResult = {
  score: number;
  earnedXp: number;
  correctAnswers: number;
  totalAnswers: number;
  newBadges: Array<{ badgeId: string; unlockedAt: string; seen: boolean }>;
};

const goalOptions = [20, 30, 50];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const vocabiAppIconImage = `${basePath}/icons/vocabi-app-icon.png`;
const vocabiBadgePackImage = `${basePath}/icons/vocabi-badge-pack.png`;
const vocabiBackgroundPackImage = `${basePath}/icons/vocabi-background-pack.png`;
const vocabiDashboardHeroImage = `${basePath}/icons/vocabi-dashboard-hero.png`;
const vocabiLessonAssetImage = `${basePath}/icons/vocabi-lesson-asset.png`;
const vocabiLessonCompleteBadgeImage = `${basePath}/icons/vocabi-lesson-complete-badge.png`;
const vocabiMarkImage = `${basePath}/icons/vocabi-mark.png`;
const vocabiProfileHeroImage = `${basePath}/icons/vocabi-profile-hero.png`;
const vocabiStatsAnalyticsImage = `${basePath}/icons/vocabi-stats-analytics.png`;
const vocabiStickerPackImage = `${basePath}/icons/vocabi-sticker-pack.png`;
const vocabiWordmarkImage = `${basePath}/icons/vocabi-wordmark.png`;

export function VocabiApp() {
  const progress = useVocabiProgress();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeReviewLesson, setActiveReviewLesson] = useState<Lesson | null>(null);
  const [activePracticeLesson, setActivePracticeLesson] = useState<Lesson | null>(null);
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);

  if (progress.loading) {
    return <LoadingScreen />;
  }

  if (progress.error) {
    return <ErrorScreen message={progress.error} onRetry={progress.refresh} />;
  }

  if (!progress.profile?.onboardingCompleted) {
    return <Onboarding onComplete={progress.completeOnboarding} />;
  }

  if (activeLesson) {
    return (
      <LessonSession
        lesson={activeLesson}
        audioSettings={progress.audioSettings}
        onBack={() => setActiveLesson(null)}
        onComplete={async (answers) => {
          const result = await progress.completeLesson({ lesson: activeLesson, answers });
          setLessonResult(result);
          setActiveLesson(null);
          setActiveTab("home");
        }}
      />
    );
  }

  if (activeReviewLesson) {
    return (
      <LessonSession
        lesson={activeReviewLesson}
        audioSettings={progress.audioSettings}
        onBack={() => setActiveReviewLesson(null)}
        onComplete={async (answers) => {
          const result = await progress.completeReviewSession({ lesson: activeReviewLesson, answers });
          setLessonResult(result);
          setActiveReviewLesson(null);
          setActiveTab("home");
        }}
      />
    );
  }

  if (activePracticeLesson) {
    return (
      <LessonSession
        lesson={activePracticeLesson}
        audioSettings={progress.audioSettings}
        onBack={() => setActivePracticeLesson(null)}
        onComplete={async (answers) => {
          const result = await progress.completeReviewSession({ lesson: activePracticeLesson, answers });
          setLessonResult(result);
          setActivePracticeLesson(null);
          setActiveTab("home");
        }}
      />
    );
  }

  return (
    <main className="min-h-dvh text-slate-100" style={{ background: "#05070b" }}>
      <div
        className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+7.25rem)] pt-[calc(env(safe-area-inset-top)+1rem)]"
        style={{ background: "radial-gradient(circle at 50% -10%, rgba(246,199,86,0.18), transparent 34%), linear-gradient(180deg, #080d14 0%, #05070b 45%, #070a10 100%)" }}
      >
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <Dashboard
              key="home"
              progress={progress}
              lessonResult={lessonResult}
              onDismissResult={() => setLessonResult(null)}
              onStartLesson={(lesson) => setActiveLesson(lesson)}
              onStartSmartSession={() => {
                const smartLesson = buildSmartSession({
                  reviewQueue: progress.reviewQueue,
                  exerciseHistory: progress.exerciseHistory,
                  getLessonStatus: progress.getLessonStatus,
                });

                if (smartLesson) {
                  setActivePracticeLesson(smartLesson);
                }
              }}
              onStartReview={() => {
                const reviewLesson = createReviewLesson(progress.reviewQueue);
                if (reviewLesson) {
                  setActiveReviewLesson(reviewLesson);
                }
              }}
            />
          )}
          {activeTab === "lessons" && (
            <LessonsView key="lessons" progress={progress} onStartLesson={(lesson) => setActiveLesson(lesson)} />
          )}
          {activeTab === "stats" && (
            <StatsView
              key="stats"
              progress={progress}
              onStartMistakes={() => {
                const mistakeLesson = buildMistakeSession(progress.exerciseHistory);

                if (mistakeLesson) {
                  setActivePracticeLesson(mistakeLesson);
                }
              }}
            />
          )}
          {activeTab === "profile" && <ProfileView key="profile" progress={progress} />}
        </AnimatePresence>
      </div>
      <MobileNav activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#05070b] px-6 pt-[env(safe-area-inset-top)] text-slate-100">
      <div className="w-full max-w-sm space-y-4">
        <div className="h-16 w-16 animate-pulse rounded-3xl bg-amber-300" />
        <div className="h-8 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-32 animate-pulse rounded-3xl bg-slate-900" />
      </div>
    </main>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#05070b] px-5 pt-[env(safe-area-inset-top)] text-slate-100">
      <Card className="max-w-sm space-y-4 border-rose-400/30 bg-slate-950 text-slate-100">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
          <X className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Oups.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        </div>
        <Button onClick={onRetry}>Réessayer</Button>
      </Card>
    </main>
  );
}

function Onboarding({ onComplete }: { onComplete: (dailyGoalXp: number) => Promise<void> }) {
  const [goal, setGoal] = useState(30);
  const [saving, setSaving] = useState(false);

  return (
    <main className="min-h-dvh bg-[#05070b] px-5 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top)-3rem)] max-w-md flex-col justify-between">
        <section className="space-y-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-3xl border border-amber-300/25 bg-slate-950 shadow-[0_0_34px_rgba(246,199,86,0.24)]">
              <Image src={vocabiAppIconImage} alt="" fill sizes="56px" className="object-cover" preload />
            </div>
            <div>
              <Image src={vocabiWordmarkImage} alt="Vocabi" width={180} height={60} className="h-8 w-auto object-contain object-left mix-blend-screen" preload />
              <h1 className="text-3xl font-black leading-tight">Ta mission anglais commence.</h1>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/20 bg-slate-950 shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
            <Image src={vocabiLessonAssetImage} alt="" width={1122} height={1402} className="h-[18rem] w-full object-cover object-[50%_36%] opacity-90" preload />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0)_38%,rgba(5,7,11,0.88)_100%)]" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Mentor Vocabi</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-200">Des mots, des réflexes, une progression qui reste à toi.</p>
            </div>
          </div>
          <Card className="space-y-5 border-slate-800 bg-slate-950 text-slate-100">
            <p className="text-base leading-7 text-slate-300">
              Des sessions courtes, du feedback direct, de l&apos;XP et une progression gardée sur ton appareil.
            </p>
            <div className="space-y-3">
              <p className="text-sm font-black text-slate-100">Choisis ton objectif quotidien</p>
              <div className="grid grid-cols-3 gap-2">
                {goalOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGoal(option)}
                    className={cn(
                      "rounded-2xl border p-4 text-center transition active:scale-95",
                      goal === option ? "border-amber-300 bg-amber-300 text-slate-950" : "border-white/10 bg-slate-900 text-slate-400",
                    )}
                  >
                    <span className="block text-xl font-black">{option}</span>
                    <span className="text-xs font-bold">XP/jour</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>
        <Button
          size="lg"
          className="rounded-full bg-amber-300 text-slate-950 shadow-[0_7px_0_rgba(120,53,15,0.65)] hover:bg-amber-200"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onComplete(goal);
          }}
        >
          Commencer
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </main>
  );
}

function Dashboard({
  progress,
  lessonResult,
  onDismissResult,
  onStartLesson,
  onStartSmartSession,
  onStartReview,
}: {
  progress: ReturnType<typeof useVocabiProgress>;
  lessonResult: LessonResult | null;
  onDismissResult: () => void;
  onStartLesson: (lesson: Lesson) => void;
  onStartSmartSession: () => void;
  onStartReview: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const nextLesson = allLessons.find((lesson) => progress.getLessonStatus(lesson.id) === "available") ?? getFirstLesson();
  const dailyPercent = progress.profile ? Math.min(100, Math.round((progress.todayXp / progress.profile.dailyGoalXp) * 100)) : 0;
  const unlockedBadgeIds = new Set(progress.badges.map((badge) => badge.badgeId));
  const currentUnit = units.find((unit) => unit.id === nextLesson.unitId) ?? units[0];
  const unitCompleted = currentUnit.lessons.filter((lesson) => {
    const status = progress.getLessonStatus(lesson.id);
    return status === "completed" || status === "mastered";
  }).length;
  const unitPercent = Math.round((unitCompleted / currentUnit.lessons.length) * 100);

  return (
    <motion.section
      variants={prefersReducedMotion ? undefined : pageVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      exit={prefersReducedMotion ? undefined : "exit"}
      className="space-y-4 text-slate-100"
    >
      <motion.header variants={prefersReducedMotion ? undefined : revealItem} className="flex items-center justify-between gap-4 pt-1">
        <button type="button" aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-300">
          <Layers3 className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <Image src={vocabiWordmarkImage} alt="Vocabi" width={150} height={50} className="h-7 w-auto max-w-[8.5rem] object-contain mix-blend-screen" preload />
          <h1 className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-slate-100">Daily Mission</h1>
        </div>
        <VocabiMark />
      </motion.header>

      {lessonResult && <LessonResultCard result={lessonResult} onDismiss={onDismissResult} />}

      <motion.section
        variants={prefersReducedMotion ? undefined : revealItem}
        className="relative overflow-hidden rounded-[2rem] border border-amber-300/20 bg-slate-950 shadow-[0_26px_70px_rgba(0,0,0,0.48)]"
      >
        {!prefersReducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              animate={slowHalo}
              className="pointer-events-none absolute -right-24 top-10 z-10 h-48 w-48 rounded-full bg-amber-300/18 blur-3xl"
            />
            <motion.div
              aria-hidden="true"
              animate={glintSweep}
              className="pointer-events-none absolute inset-y-0 z-20 w-24 rotate-12 bg-gradient-to-r from-transparent via-white/12 to-transparent"
            />
          </>
        )}
        <Image src={vocabiDashboardHeroImage} alt="" width={1122} height={1402} className="h-[22rem] w-full object-cover object-[50%_26%] opacity-90" preload />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.22)_0%,rgba(5,7,11,0.36)_42%,rgba(5,7,11,0.98)_100%)]" />
        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-black/40 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-200 backdrop-blur">
              <CalendarCheck2 className="h-4 w-4" />
              Mission du jour
            </p>
            <h2 className="mt-4 max-w-[13rem] text-[2.35rem] font-black uppercase leading-[0.95] tracking-normal text-white">
              {nextLesson.title}
            </h2>
          </div>
          <div className="grid h-[4.6rem] w-[4.6rem] shrink-0 place-items-center rounded-full border border-amber-300/35 bg-black/45 shadow-[0_0_32px_rgba(246,199,86,0.22)] backdrop-blur">
            <div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#f6c756 ${dailyPercent * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }}>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-xs font-black text-amber-200">{dailyPercent}%</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-4 p-5 pt-0" style={{ marginTop: "-5.75rem" }}>
          <p className="max-w-[18rem] text-sm font-bold leading-6 text-slate-300">{nextLesson.description}</p>

          <motion.div variants={prefersReducedMotion ? undefined : revealContainer} initial={prefersReducedMotion ? false : "hidden"} animate="visible" className="grid grid-cols-3 gap-2">
            <Metric icon={<Flame className="h-5 w-5" />} label="Série" value={`${progress.streak}j`} tone="sun" />
            <Metric icon={<Sparkles className="h-5 w-5" />} label="XP" value={progress.totalXp.toString()} tone="mint" />
            <Metric icon={<Trophy className="h-5 w-5" />} label="Leçons" value={progress.completedLessons.toString()} tone="sky" />
          </motion.div>

          <div className="space-y-3 rounded-[1.4rem] border border-slate-800 bg-slate-900/80 p-3 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              <span>{progress.todayXp}/{progress.profile?.dailyGoalXp ?? 30} XP</span>
              <span>{nextLesson.estimatedMinutes} min · {nextLesson.difficulty}</span>
            </div>
            <ProgressBar value={dailyPercent} className="bg-white/10" />
          </div>
          <Button className="h-14 w-full rounded-full border border-amber-300/35 bg-amber-300 text-slate-950 shadow-[0_0_34px_rgba(246,199,86,0.22),0_7px_0_rgba(120,53,15,0.65)] hover:bg-amber-200" size="lg" onClick={() => onStartLesson(nextLesson)}>
            Entrer en mission
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.section>

      <motion.div variants={prefersReducedMotion ? undefined : revealItem}>
        <SmartSessionCard progress={progress} onStartSmartSession={onStartSmartSession} />
      </motion.div>
      <motion.div variants={prefersReducedMotion ? undefined : revealItem}>
        <ReviewMissionCard progress={progress} onStartReview={onStartReview} />
      </motion.div>

      <motion.section variants={prefersReducedMotion ? undefined : revealItem} className="space-y-4 rounded-[1.6rem] border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-300">
              <Layers3 className="h-4 w-4" />
              Roadmap
            </p>
            <h2 className="mt-1 text-xl font-black text-white">{currentUnit.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">{currentUnit.description}</p>
          </div>
          <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">{unitCompleted}/{currentUnit.lessons.length}</span>
        </div>
        <ProgressBar value={unitPercent} className="bg-slate-900" />
        <div className="relative space-y-3 pt-1">
          <span className="absolute bottom-8 left-[1.15rem] top-8 w-1 rounded-full bg-slate-900" />
          {currentUnit.lessons.map((lesson, lessonIndex) => {
            const status = progress.getLessonStatus(lesson.id);
            const active = lesson.id === nextLesson.id;
            const done = status === "completed" || status === "mastered";
            return (
              <motion.button
                key={lesson.id}
                type="button"
                disabled={status === "locked"}
                onClick={() => onStartLesson(lesson)}
                variants={prefersReducedMotion ? undefined : pressable}
                initial="rest"
                whileTap={status === "locked" || prefersReducedMotion ? undefined : "tap"}
                className={cn(
                  "relative z-10 flex min-h-16 w-full items-center gap-3 rounded-[1.4rem] px-2 py-2 text-left transition",
                  active ? "bg-amber-300/10 shadow-[inset_0_0_0_1px_rgba(246,199,86,0.18),0_0_24px_rgba(246,199,86,0.08)]" : "bg-transparent",
                  status === "locked" && "opacity-55",
                )}
              >
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black shadow-sm", done ? "bg-emerald-400 text-slate-950" : active ? "bg-amber-300 text-slate-950" : "bg-slate-900 text-slate-500 ring-1 ring-slate-800")}>
                  {done ? <Check className="h-5 w-5" /> : lessonIndex + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-slate-100">{lesson.title}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {lesson.estimatedMinutes} min · {lesson.difficulty}
                  </span>
                </span>
                {active && (
                  <motion.span animate={prefersReducedMotion ? undefined : { opacity: [0.65, 1, 0.65], scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
                    <Zap className="h-5 w-5 text-amber-300" />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <motion.section variants={prefersReducedMotion ? undefined : revealItem} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Badges</h2>
          <span className="text-sm font-bold text-slate-400">{progress.badges.length}/{badgeDefinitions.length}</span>
        </div>
        <div className="space-y-2">
          {badgeDefinitions.slice(0, 2).map((badge) => (
            <BadgePill key={badge.id} badge={badge} unlocked={unlockedBadgeIds.has(badge.id)} />
          ))}
        </div>
      </motion.section>
    </motion.section>
  );
}

function SmartSessionCard({ progress, onStartSmartSession }: { progress: ReturnType<typeof useVocabiProgress>; onStartSmartSession: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const smartLesson = buildSmartSession({
    reviewQueue: progress.reviewQueue,
    exerciseHistory: progress.exerciseHistory,
    getLessonStatus: progress.getLessonStatus,
  });
  const reviewCount = progress.reviewQueue.length;
  const mistakeCount = progress.exerciseHistory.filter((item) => !item.correct).length;

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-sky-300/24 bg-slate-950 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.32)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_20%,rgba(125,211,252,0.22),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(246,199,86,0.14),transparent_32%)]" />
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          animate={glintSweep}
          className="pointer-events-none absolute inset-y-0 w-20 rotate-12 bg-gradient-to-r from-transparent via-sky-100/12 to-transparent"
        />
      )}
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-sky-300">
              <Zap className="h-4 w-4" />
              Session intelligente
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">5 minutes utiles</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-400">
              Nouveau contenu, révision due et erreurs récentes dans une seule boucle courte.
            </p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-sky-300/35 bg-sky-300/10">
            <span className="text-lg font-black text-sky-200">{smartLesson?.exercises.length ?? 0}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniReviewStat label="Révisions" value={reviewCount.toString()} tone="emerald" />
          <MiniReviewStat label="Erreurs" value={mistakeCount.toString()} tone="amber" />
          <MiniReviewStat label="Durée" value={`${smartLesson?.estimatedMinutes ?? 0}m`} tone="sky" />
        </div>
        <Button variant="secondary" className="w-full border-sky-300/25" disabled={!smartLesson} onClick={onStartSmartSession}>
          <Zap className="h-5 w-5" />
          Lancer une session 5 min
        </Button>
      </div>
    </section>
  );
}

function ReviewMissionCard({ progress, onStartReview }: { progress: ReturnType<typeof useVocabiProgress>; onStartReview: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const dueCount = progress.reviewSummary.dueCount;
  const hasDueCards = dueCount > 0 && progress.reviewQueue.length > 0;
  const nextDue = progress.reviewSummary.nextDueAt ? formatShortDate(progress.reviewSummary.nextDueAt) : "Après ta prochaine leçon";

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-emerald-300/24 bg-slate-950 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.32)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(52,211,153,0.22),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(246,199,86,0.12),transparent_32%)]" />
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          animate={slowHalo}
          className="pointer-events-none absolute -right-16 -top-10 h-36 w-36 rounded-full bg-emerald-300/16 blur-3xl"
        />
      )}
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
              <Brain className="h-4 w-4" />
              Révision intelligente
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{hasDueCards ? `${dueCount} carte${dueCount > 1 ? "s" : ""} à ancrer` : "Mémoire à jour"}</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-400">
              {hasDueCards ? "Priorité aux erreurs, aux cartes faibles et aux mots qui arrivent à échéance." : `Prochaine échéance : ${nextDue}.`}
            </p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-emerald-300/35 bg-emerald-300/10">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-300 text-lg font-black text-slate-950">
              {progress.reviewSummary.averageMastery}%
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniReviewStat label="À revoir" value={dueCount.toString()} tone="emerald" />
          <MiniReviewStat label="Fragiles" value={progress.reviewSummary.weakCount.toString()} tone="amber" />
          <MiniReviewStat label="Ancrées" value={progress.reviewSummary.masteredCount.toString()} tone="sky" />
        </div>
        <Button
          variant={hasDueCards ? "primary" : "secondary"}
          className={cn("w-full", hasDueCards && "bg-emerald-300 text-slate-950 shadow-[0_7px_0_rgba(6,78,59,0.88)] hover:bg-emerald-200")}
          disabled={!hasDueCards}
          onClick={onStartReview}
        >
          <RotateCcw className="h-5 w-5" />
          Lancer la révision
        </Button>
      </div>
    </section>
  );
}

function MiniReviewStat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "sky" }) {
  const toneClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    sky: "text-sky-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
      <p className={cn("text-xl font-black leading-none", toneClass)}>{value}</p>
      <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "sun" | "mint" | "sky" }) {
  const toneClass = {
    sun: "bg-amber-300 text-slate-950",
    mint: "bg-emerald-300 text-slate-950",
    sky: "bg-sky-300 text-slate-950",
  }[tone];

  return (
    <motion.div variants={revealItem} className="min-h-[5.5rem] rounded-[1.15rem] border border-slate-800 bg-slate-900/80 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className={cn("mb-2 grid h-8 w-8 place-items-center rounded-full", toneClass)}>{icon}</div>
      <p className="text-[1.35rem] font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[0.72rem] font-bold text-slate-400">{label}</p>
    </motion.div>
  );
}

function VocabiMark() {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-amber-300/25 bg-slate-950 shadow-[0_0_24px_rgba(246,199,86,0.16)]">
      <Image src={vocabiMarkImage} alt="Profil Vocabi" fill sizes="48px" className="object-cover" />
    </div>
  );
}

function LessonResultCard({ result, onDismiss }: { result: LessonResult; onDismiss: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const unlockedBadges = result.newBadges
    .map((badge) => badgeDefinitions.find((definition) => definition.id === badge.badgeId))
    .filter((badge): badge is NonNullable<typeof badge> => badge !== undefined);
  const resultMessage = result.score === 100
    ? "Parfait. Cette mission est maîtrisée."
    : result.score >= 80
      ? "Solide. La mémoire commence à bien accrocher."
      : "Progression enregistrée. Les erreurs reviendront en révision.";

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="space-y-4 overflow-hidden border-amber-300/35 bg-slate-950 p-0 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.42)]">
        <div className="relative min-h-44 p-5">
          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              animate={glintSweep}
              className="pointer-events-none absolute inset-y-0 z-20 w-20 rotate-12 bg-gradient-to-r from-transparent via-amber-100/18 to-transparent"
            />
          )}
          <Image src={vocabiLessonCompleteBadgeImage} alt="" fill sizes="384px" className="object-cover object-center opacity-85" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,0.96)_0%,rgba(5,7,11,0.72)_46%,rgba(5,7,11,0.18)_100%)]" />
          <div className="relative max-w-[13rem]">
            <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-300">
              <Star className="h-4 w-4 fill-amber-300" />
              Leçon terminée
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-normal">+{result.earnedXp} XP</h2>
            <p className="mt-1 text-sm font-bold leading-5 text-slate-300">{result.correctAnswers}/{result.totalAnswers} bonnes réponses - {result.score}%</p>
          </div>
        </div>
        <div className="space-y-4 p-5 pt-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-300">Récompense active</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-400">{resultMessage}</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-amber-300 text-amber-950">
              <Trophy className="h-7 w-7" />
            </div>
          </div>
          <ProgressBar value={result.score} className="bg-white/10" />
          {unlockedBadges.length > 0 && (
            <div className="space-y-2 rounded-[1.2rem] border border-amber-300/28 bg-amber-300/10 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-200">Nouveau badge</p>
              {unlockedBadges.map((badge, badgeIndex) => (
                <motion.p
                  key={badge.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: badgeIndex * 0.06 }}
                  className="text-sm font-black text-amber-50"
                >
                  {badge.title}
                </motion.p>
              ))}
            </div>
          )}
          <Button variant="secondary" className="w-full" onClick={onDismiss}>Continuer</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function LessonsView({ progress, onStartLesson }: { progress: ReturnType<typeof useVocabiProgress>; onStartLesson: (lesson: Lesson) => void }) {
  const [mode, setMode] = useState<"path" | "lexicon">("path");

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow={mode === "path" ? "Parcours" : "Carnet"} title={mode === "path" ? "Tes unités" : "Ton lexique"} />
      <div className="grid grid-cols-2 gap-2 rounded-[1.3rem] border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          onClick={() => setMode("path")}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-[1rem] text-sm font-black transition active:scale-95",
            mode === "path" ? "bg-amber-300 text-slate-950" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200",
          )}
        >
          <Layers3 className="h-4 w-4" />
          Parcours
        </button>
        <button
          type="button"
          onClick={() => setMode("lexicon")}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-[1rem] text-sm font-black transition active:scale-95",
            mode === "lexicon" ? "bg-emerald-300 text-slate-950" : "text-slate-500 hover:bg-slate-900 hover:text-slate-200",
          )}
        >
          <LibraryBig className="h-4 w-4" />
          Lexique
        </button>
      </div>
      {mode === "path" ? <LearningPath progress={progress} onStartLesson={onStartLesson} /> : <LexiconView progress={progress} />}
    </motion.section>
  );
}

function LearningPath({ progress, onStartLesson }: { progress: ReturnType<typeof useVocabiProgress>; onStartLesson: (lesson: Lesson) => void }) {
  return (
    <>
      <section className="relative overflow-hidden rounded-[1.6rem] border border-amber-300/20 bg-slate-950 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
        <Image src={vocabiLessonAssetImage} alt="" width={1122} height={1402} className="h-48 w-full object-cover object-[50%_42%] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,0.96)_0%,rgba(5,7,11,0.72)_46%,rgba(5,7,11,0.16)_100%)]" />
        <div className="absolute inset-0 flex items-end p-4">
          <div className="max-w-[13rem]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-300">Nouveaux mots</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-white">Choisis ta prochaine mission.</h2>
          </div>
        </div>
      </section>
      {units.map((unit) => (
        <section key={unit.id} className="space-y-3">
          <div>
            <h2 className="text-xl font-black">{unit.title}</h2>
            <p className="text-sm leading-6 text-slate-400">{unit.description}</p>
          </div>
          <div className="space-y-3">
            {unit.lessons.map((lesson) => {
              const status = progress.getLessonStatus(lesson.id);
              const locked = status === "locked";
              return (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={locked}
                  onClick={() => onStartLesson(lesson)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-[1.25rem] border bg-slate-950 p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition active:scale-[0.99]",
                    locked ? "border-slate-800 opacity-45" : "border-amber-300/24 hover:-translate-y-0.5",
                  )}
                >
                  <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", locked ? "bg-slate-900 text-slate-600" : "bg-amber-300 text-slate-950")}>
                    {status === "mastered" || status === "completed" ? <BadgeCheck className="h-6 w-6" /> : <BookOpenCheck className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-slate-100">{lesson.title}</h3>
                    <p className="line-clamp-2 text-sm leading-5 text-slate-400">{lesson.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function LexiconView({ progress }: { progress: ReturnType<typeof useVocabiProgress> }) {
  const [filter, setFilter] = useState<"all" | LexiconStatus>("all");
  const [query, setQuery] = useState("");
  const entries = useMemo(() => buildLexiconEntries({
    exerciseMastery: progress.exerciseMastery,
    exerciseHistory: progress.exerciseHistory,
    getLessonStatus: progress.getLessonStatus,
  }), [progress.exerciseHistory, progress.exerciseMastery, progress.getLessonStatus]);
  const summary = useMemo(() => summarizeLexicon(entries), [entries]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntries = entries.filter((entry) => {
    const matchesFilter = filter === "all" || entry.status === filter;
    const haystack = `${entry.prompt} ${entry.expected} ${entry.lessonTitle} ${entry.unitTitle}`.toLowerCase();
    return matchesFilter && (normalizedQuery.length === 0 || haystack.includes(normalizedQuery));
  });

  return (
    <section className="space-y-4">
      <section className="relative overflow-hidden rounded-[1.6rem] border border-emerald-300/20 bg-slate-950 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
        <Image src={vocabiStickerPackImage} alt="" width={1254} height={1254} className="absolute -right-24 -top-32 h-80 w-80 object-cover opacity-24" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-300">
                <LibraryBig className="h-4 w-4" />
                Lexique personnel
              </p>
              <h2 className="mt-1 text-3xl font-black text-white">{summary.total} entrées</h2>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-400">Tes mots, phrases et associations se rangent ici au fil des missions.</p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-emerald-300/30 bg-emerald-300/10">
              <span className="text-lg font-black text-emerald-200">{summary.averageMastery}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniReviewStat label="À revoir" value={summary.due.toString()} tone="emerald" />
            <MiniReviewStat label="Fragiles" value={summary.fragile.toString()} tone="amber" />
            <MiniReviewStat label="Stables" value={summary.steady.toString()} tone="sky" />
          </div>
        </div>
      </section>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un mot, une réponse..."
          className="h-14 w-full rounded-[1.25rem] border border-slate-800 bg-slate-950 pl-12 pr-4 text-sm font-bold text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/15"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {lexiconFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-10 shrink-0 rounded-full border px-4 text-xs font-black transition active:scale-95",
              filter === item.id ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-slate-800 bg-slate-950 text-slate-400",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleEntries.length === 0 ? (
          <Card className="space-y-2 border-slate-800 bg-slate-950 text-slate-100">
            <h2 className="text-lg font-black">Rien ici pour l&apos;instant.</h2>
            <p className="text-sm leading-6 text-slate-400">Fais une mission ou ajuste la recherche pour remplir ce carnet.</p>
          </Card>
        ) : (
          visibleEntries.map((entry) => <LexiconCard key={`${entry.lessonId}-${entry.exercise.id}`} entry={entry} audioSettings={progress.audioSettings} />)
        )}
      </div>
    </section>
  );
}

const lexiconFilters: Array<{ id: "all" | LexiconStatus; label: string }> = [
  { id: "all", label: "Tout" },
  { id: "due", label: "À revoir" },
  { id: "fragile", label: "Fragiles" },
  { id: "steady", label: "Stables" },
  { id: "fresh", label: "Nouveaux" },
];

function LexiconCard({ entry, audioSettings }: { entry: LexiconEntry; audioSettings: AudioSettings }) {
  const statusMeta = getLexiconStatusMeta(entry.status);
  const speechTarget = getExerciseSpeechTarget(entry.exercise);

  return (
    <article className="rounded-[1.35rem] border border-slate-800 bg-slate-950 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em]", statusMeta.className)}>
              {statusMeta.label}
            </span>
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-slate-500">{entry.direction}</span>
          </div>
          <h3 className="mt-3 text-xl font-black leading-tight text-white">{entry.prompt}</h3>
          <p className="mt-1 text-sm font-bold leading-6 text-emerald-200">{entry.expected}</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-900">
          <span className="text-sm font-black text-slate-100">{entry.masteryLevel}%</span>
        </div>
      </div>
      {speechTarget && (
        <div className="mt-4">
          <SpeechButton target={speechTarget.text} label={speechTarget.label} audioSettings={audioSettings} variant="wide" />
        </div>
      )}
      <div className="mt-4 space-y-2">
        <ProgressBar value={entry.masteryLevel} className="bg-slate-900" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
          <span>{entry.unitTitle}</span>
          <span>{entry.lessonTitle}</span>
          <span>{entry.attempts} essai{entry.attempts > 1 ? "s" : ""}</span>
          {entry.mistakes > 0 && <span className="text-rose-300">{entry.mistakes} erreur{entry.mistakes > 1 ? "s" : ""}</span>}
          {entry.dueAt && <span>Échéance {formatShortDate(entry.dueAt)}</span>}
        </div>
      </div>
    </article>
  );
}

function getLexiconStatusMeta(status: LexiconStatus) {
  if (status === "due") {
    return { label: "À revoir", className: "bg-emerald-300 text-slate-950" };
  }

  if (status === "fragile") {
    return { label: "Fragile", className: "bg-amber-300 text-slate-950" };
  }

  if (status === "steady") {
    return { label: "Stable", className: "bg-sky-300 text-slate-950" };
  }

  return { label: "Nouveau", className: "bg-slate-800 text-slate-300" };
}

function SpeechButton({
  target,
  label,
  audioSettings,
  size = "default",
  variant = "compact",
}: {
  target: string;
  label: string;
  audioSettings: AudioSettings;
  size?: "default" | "sm";
  variant?: "compact" | "wide";
}) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={cn("min-w-0", variant === "wide" && "w-full")}>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => {
          const spoken = speakEnglish(target, audioSettings);
          setMessage(spoken ? "Lecture en cours" : "Audio indisponible sur ce navigateur");
          window.setTimeout(() => setMessage(null), 1800);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/24 bg-emerald-300/10 font-black text-emerald-100 transition active:scale-95",
          size === "sm" ? "h-8 w-8 px-0" : "h-11 px-4 text-sm",
          variant === "wide" && "w-full",
        )}
      >
        <Volume2 className="h-4 w-4" />
        {size !== "sm" && <span>Écouter</span>}
      </button>
      {message && variant === "wide" && <p className="mt-2 text-xs font-bold text-slate-500">{message}</p>}
    </div>
  );
}

function StatsView({ progress, onStartMistakes }: { progress: ReturnType<typeof useVocabiProgress>; onStartMistakes: () => void }) {
  const recentMistakes = useMemo(() => progress.exerciseHistory.filter((item) => !item.correct).slice(-5).reverse(), [progress.exerciseHistory]);
  const dueReviews = progress.reviewQueue.slice(0, 5);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Progression" title="Tes stats" />
      <section className="relative overflow-hidden rounded-[1.8rem] border border-amber-300/20 bg-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.38)]">
        <Image src={vocabiStatsAnalyticsImage} alt="" width={1122} height={1402} className="h-60 w-full object-cover object-[50%_35%] opacity-86" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.08)_0%,rgba(5,7,11,0.72)_58%,rgba(5,7,11,0.98)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-300">Analytics</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-black text-white">{progress.accuracy}%</p>
              <p className="text-sm font-bold text-slate-300">Précision globale</p>
            </div>
            <div className="rounded-full border border-amber-300/25 bg-black/45 px-3 py-2 text-sm font-black text-amber-200 backdrop-blur">
              {progress.totalExercises} exercices
            </div>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="XP total" value={progress.totalXp.toString()} />
        <StatCard label="Précision" value={`${progress.accuracy}%`} />
        <StatCard label="Série" value={`${progress.streak} jour(s)`} />
        <StatCard label="Leçons" value={progress.completedLessons.toString()} />
        <StatCard label="Meilleure série" value={`${progress.bestStreak} jour(s)`} />
        <StatCard label="Exercices" value={progress.totalExercises.toString()} />
      </div>
      <Card className="space-y-4 border-emerald-300/20 bg-slate-950 text-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">Mémoire</p>
            <h2 className="mt-1 text-2xl font-black">{progress.reviewSummary.averageMastery}% maîtrisé</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {progress.reviewSummary.dueCount > 0 ? `${progress.reviewSummary.dueCount} carte(s) prête(s) à revoir.` : "Aucune carte due maintenant."}
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-300 text-slate-950">
            <Brain className="h-7 w-7" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniReviewStat label="À revoir" value={progress.reviewSummary.dueCount.toString()} tone="emerald" />
          <MiniReviewStat label="Fragiles" value={progress.reviewSummary.weakCount.toString()} tone="amber" />
          <MiniReviewStat label="Ancrées" value={progress.reviewSummary.masteredCount.toString()} tone="sky" />
        </div>
        <ProgressBar value={progress.reviewSummary.averageMastery} className="bg-slate-900" />
      </Card>
      <Card className="space-y-3">
        <h2 className="text-lg font-black">Activité récente</h2>
        {progress.dailyStats.length === 0 ? (
          <p className="text-sm leading-6 text-slate-400">Aucune activité pour l&apos;instant. Une leçon et cette zone prendra vie.</p>
        ) : (
          progress.dailyStats.slice(-5).reverse().map((day) => (
            <div key={day.date} className="flex items-center justify-between rounded-2xl bg-slate-900 p-3">
              <span className="text-sm font-bold text-slate-300">{day.date}</span>
              <span className="text-sm font-black text-emerald-700">+{day.xp} XP</span>
            </div>
          ))
        )}
      </Card>
      <Card className="space-y-3">
        <h2 className="text-lg font-black">File de révision</h2>
        {dueReviews.length === 0 ? (
          <p className="text-sm leading-6 text-slate-400">
            Rien à revoir maintenant. Prochaine échéance : {progress.reviewSummary.nextDueAt ? formatShortDate(progress.reviewSummary.nextDueAt) : "après une nouvelle leçon"}.
          </p>
        ) : (
          dueReviews.map((item) => (
            <div key={item.mastery.exerciseId} className="rounded-2xl border border-emerald-300/16 bg-slate-900 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-100">{item.exercise.prompt}</p>
                  <p className="text-xs font-bold leading-5 text-slate-400">Échéance : {formatShortDate(item.mastery.dueAt)}</p>
                </div>
                <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-black text-slate-950">{item.mastery.masteryLevel}%</span>
              </div>
            </div>
          ))
        )}
      </Card>
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Dernières erreurs</h2>
            <p className="text-sm leading-6 text-slate-400">Transforme tes accrocs récents en mini-session ciblée.</p>
          </div>
          {recentMistakes.length > 0 && (
            <Button size="sm" variant="danger" onClick={onStartMistakes}>
              Rejouer
            </Button>
          )}
        </div>
        {recentMistakes.length === 0 ? (
          <p className="text-sm leading-6 text-slate-400">Aucune erreur enregistrée pour l&apos;instant. C&apos;est bon signe.</p>
        ) : (
          recentMistakes.map((item) => (
            <div key={item.id} className="rounded-2xl bg-rose-50 p-3">
              <p className="text-sm font-black text-rose-900">{getExerciseById(item.exerciseId)?.prompt ?? item.exerciseId}</p>
              <p className="text-xs font-bold leading-5 text-slate-400">Réponse attendue : {formatExpected(item.expected)}</p>
            </div>
          ))
        )}
      </Card>
      <section className="relative overflow-hidden rounded-[1.6rem] border border-slate-800 bg-slate-950 p-4">
        <Image src={vocabiBadgePackImage} alt="" width={1254} height={1254} className="absolute inset-0 h-full w-full object-cover object-center opacity-25" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-300">Achievements</p>
          <h2 className="mt-1 text-xl font-black text-white">{progress.badges.length}/{badgeDefinitions.length} badges</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-400">Les récompenses se rempliront au fil des sessions.</p>
        </div>
      </section>
    </motion.section>
  );
}

function ProfileView({ progress }: { progress: ReturnType<typeof useVocabiProgress> }) {
  const unlockedBadgeIds = new Set(progress.badges.map((badge) => badge.badgeId));
  const [busy, setBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [goalMessage, setGoalMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setBusy(true);
      const raw = await file.text();
      let parsed: unknown;

      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Ce fichier n'est pas un JSON valide.");
      }

      await progress.importData(parsed);
      setBackupMessage("Sauvegarde importée. Tes données locales ont été remplacées.");
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : "Impossible d'importer cette sauvegarde.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Local-first" title="Profil & sauvegarde" />
      <ProfileIdentityCard progress={progress} />
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-black">Objectif quotidien</h2>
          <p className="text-sm leading-6 text-slate-400">Actuel : {progress.profile?.dailyGoalXp ?? 30} XP par jour.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {goalOptions.map((goal) => (
            <button
              key={goal}
              type="button"
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  await progress.updateDailyGoal(goal);
                  setGoalMessage(`Objectif mis à jour : ${goal} XP par jour.`);
                } catch (error) {
                  setGoalMessage(error instanceof Error ? error.message : "Impossible de mettre à jour l'objectif.");
                } finally {
                  setBusy(false);
                }
              }}
              className={cn(
                "rounded-2xl border p-3 text-center text-sm font-black transition active:scale-95",
                progress.profile?.dailyGoalXp === goal ? "border-amber-300 bg-amber-300 text-slate-950" : "border-slate-800 bg-slate-900 text-slate-400",
              )}
            >
              {goal} XP
            </button>
          ))}
        </div>
        {goalMessage && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-800">{goalMessage}</p>}
      </Card>
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-300/10 text-emerald-200">
            <Volume2 className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black">Audio anglais</h2>
            <p className="text-sm leading-5 text-slate-400">Lecture locale avec la voix du navigateur.</p>
          </div>
        </div>
        <AudioToggle
          title="Lecture automatique"
          description="Lance l'audio au début de chaque question compatible."
          checked={progress.audioSettings.autoSpeak}
          disabled={busy}
          onChange={async (checked) => {
            try {
              setBusy(true);
              await progress.updateAudioSettings({ ...progress.audioSettings, autoSpeak: checked });
            } catch (error) {
              setBackupMessage(error instanceof Error ? error.message : "Impossible de mettre à jour l'audio.");
            } finally {
              setBusy(false);
            }
          }}
        />
        <AudioToggle
          title="Mode lent"
          description="Ralentit la prononciation pour mieux distinguer les sons."
          checked={progress.audioSettings.slowMode}
          disabled={busy}
          onChange={async (checked) => {
            try {
              setBusy(true);
              await progress.updateAudioSettings({ ...progress.audioSettings, slowMode: checked });
            } catch (error) {
              setBackupMessage(error instanceof Error ? error.message : "Impossible de mettre à jour l'audio.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-950 text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black">Données locales</h2>
            <p className="text-sm leading-5 text-slate-400">Ta progression reste sur cet appareil.</p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          disabled={busy}
          onClick={async () => {
            try {
              setBusy(true);
              const data = await progress.exportData();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `vocabi-backup-${new Date().toISOString().slice(0, 10)}.json`;
              anchor.click();
              URL.revokeObjectURL(url);
              setBackupMessage("Sauvegarde exportée.");
            } catch (error) {
              setBackupMessage(error instanceof Error ? error.message : "Impossible d'exporter la sauvegarde.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Exporter une sauvegarde
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        <Button
          variant="secondary"
          className="w-full"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />
          Importer une sauvegarde
        </Button>
        <Button
          variant="danger"
          className="w-full"
          disabled={busy}
          onClick={async () => {
            if (!window.confirm("Réinitialiser toute la progression locale Vocabi ?")) return;
            try {
              setBusy(true);
              await progress.resetData();
              setBackupMessage("Progression locale réinitialisée.");
            } catch (error) {
              setBackupMessage(error instanceof Error ? error.message : "Impossible de réinitialiser les données locales.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <RotateCcw className="h-5 w-5" />
          Reset local
        </Button>
        {backupMessage && <p className="rounded-2xl bg-slate-900 p-3 text-sm font-bold leading-6 text-slate-300">{backupMessage}</p>}
      </Card>
      <section className="space-y-3">
        <h2 className="text-lg font-black">Tous les badges</h2>
        {badgeDefinitions.map((badge) => (
          <BadgePill key={badge.id} badge={badge} unlocked={unlockedBadgeIds.has(badge.id)} />
        ))}
      </section>
    </motion.section>
  );
}

function ProfileIdentityCard({ progress }: { progress: ReturnType<typeof useVocabiProgress> }) {
  return (
    <Card className="overflow-hidden border-amber-300/24 bg-slate-950 p-0 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
      <div className="relative min-h-72 p-5">
        <Image src={vocabiProfileHeroImage} alt="" fill sizes="384px" className="object-cover object-[50%_20%] opacity-86" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.28)_0%,rgba(5,7,11,0.55)_48%,rgba(5,7,11,0.98)_100%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <Image src={vocabiWordmarkImage} alt="Vocabi" width={170} height={57} className="h-8 w-auto object-contain object-left mix-blend-screen" />
            <p className="mt-2 max-w-[13rem] text-sm font-bold leading-6 text-slate-300">Ton identité locale reste sur ton appareil.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ProfileMiniStat label="XP" value={progress.totalXp.toString()} />
            <ProfileMiniStat label="Série" value={`${progress.streak}j`} />
            <ProfileMiniStat label="Badges" value={progress.badges.length.toString()} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function AudioToggle({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => Promise<void>;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] border border-slate-800 bg-slate-900 p-4 text-left transition active:scale-[0.99] disabled:opacity-50"
    >
      <span>
        <span className="block text-sm font-black text-slate-100">{title}</span>
        <span className="mt-1 block text-xs font-bold leading-5 text-slate-500">{description}</span>
      </span>
      <span className={cn("flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition", checked ? "bg-emerald-300" : "bg-slate-800")}>
        <span className={cn("h-6 w-6 rounded-full bg-slate-950 shadow-sm transition", checked && "translate-x-6")} />
      </span>
    </button>
  );
}

function ProfileMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/76 p-2 backdrop-blur">
      <p className="text-lg font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-amber-300">{label}</p>
    </div>
  );
}

function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="pt-1">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-300">{eyebrow}</p>
      <h1 className="text-3xl font-black tracking-normal text-slate-100">{title}</h1>
    </header>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </Card>
  );
}

function LessonSession({
  lesson,
  audioSettings,
  onBack,
  onComplete,
}: {
  lesson: Lesson;
  audioSettings: AudioSettings;
  onBack: () => void;
  onComplete: (answers: Array<{ exercise: Exercise; answer: string | string[]; correct: boolean; durationMs: number }>) => Promise<void>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | string[]>("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answers, setAnswers] = useState<Array<{ exercise: Exercise; answer: string | string[]; correct: boolean; durationMs: number }>>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [finishing, setFinishing] = useState(false);
  const exercise = lesson.exercises[index];
  const progressValue = Math.round(((index + (feedback ? 1 : 0)) / lesson.exercises.length) * 100);
  const exerciseTone = getExerciseTone(exercise.kind);
  const speechTarget = useMemo(() => getExerciseSpeechTarget(exercise), [exercise]);

  useEffect(() => {
    if (audioSettings.autoSpeak && speechTarget) {
      const timeout = window.setTimeout(() => speakEnglish(speechTarget.text, audioSettings), 320);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [audioSettings, exercise.id, speechTarget]);

  const submit = async () => {
    const correct = isAnswerCorrect(exercise, answer);
    const nextAnswer = { exercise, answer, correct, durationMs: Date.now() - startedAt };
    const nextAnswers = [...answers, nextAnswer];
    setAnswers(nextAnswers);
    setFeedback(correct ? "correct" : "wrong");

    window.setTimeout(async () => {
      if (index === lesson.exercises.length - 1) {
        setFinishing(true);
        await onComplete(nextAnswers);
      } else {
        setIndex((current) => current + 1);
        setAnswer("");
        setFeedback(null);
        setStartedAt(Date.now());
      }
    }, correct ? 650 : 900);
  };

  return (
    <main className="min-h-dvh bg-[#05070b] px-4 pb-5 pt-[calc(env(safe-area-inset-top)+1rem)] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top)-2rem)] max-w-md flex-col">
        <header className="mb-5 flex items-center gap-3">
          <button type="button" onClick={onBack} aria-label="Retour" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-300 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-black uppercase tracking-[0.12em] text-amber-300">{lesson.title}</p>
              <span className="text-xs font-black text-slate-400">{index + 1}/{lesson.exercises.length}</span>
            </div>
            <ProgressBar value={progressValue} className="bg-slate-900" />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-between gap-5">
          <AnimatePresence mode="wait">
            <motion.section
              key={exercise.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
              animate={feedback === "correct" && !prefersReducedMotion ? successPulse : feedback === "wrong" && !prefersReducedMotion ? errorShake : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="space-y-4"
            >
              <Card className="relative space-y-4 overflow-hidden border-amber-300/18 bg-slate-950 p-0 text-slate-100 shadow-[0_24px_58px_rgba(0,0,0,0.35)]">
                {!prefersReducedMotion && (
                  <motion.div
                    aria-hidden="true"
                    animate={glintSweep}
                    className="pointer-events-none absolute inset-y-0 z-20 w-20 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
                <div className="relative h-28">
                  <Image src={vocabiBackgroundPackImage} alt="" fill sizes="384px" className="object-cover object-[50%_75%] opacity-50" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.05)_0%,rgba(15,23,42,0.96)_100%)]" />
                  <StickerCrop />
                </div>
                <div className="space-y-4 p-5 pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em]", exerciseTone.className)}>
                      {exerciseTone.icon}
                      {exerciseTone.label}
                    </span>
                    {speechTarget && <SpeechButton target={speechTarget.text} label={speechTarget.label} audioSettings={audioSettings} size="sm" />}
                  </div>
                  <span className="shrink-0 text-sm font-black text-amber-300">+{exercise.xp} XP</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">{exercise.instruction}</p>
                  <h1 className="mt-3 text-[2rem] font-black leading-tight tracking-normal">{exercise.prompt}</h1>
                </div>
                {exercise.hint && <p className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3 text-sm font-bold leading-6 text-sky-100">Indice: {exercise.hint}</p>}
                </div>
              </Card>
              <ExerciseInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={feedback !== null || finishing} />
            </motion.section>
          </AnimatePresence>

          <div className="sticky bottom-4 space-y-3 pb-[env(safe-area-inset-bottom)]">
            <AnimatePresence>
              {feedback && (
                <motion.div initial="hidden" animate="visible" exit="hidden" variants={feedbackVariants}>
                  <Card className={cn("flex items-center gap-3 p-4 shadow-[0_18px_42px_rgba(0,0,0,0.35)]", feedback === "correct" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-50" : "border-rose-300/30 bg-rose-400/10 text-rose-50")}>
                    <div className={cn("grid h-10 w-10 place-items-center rounded-2xl text-white", feedback === "correct" ? "bg-emerald-500" : "bg-rose-500")}>
                      {feedback === "correct" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-black">{feedback === "correct" ? "Bien joué !" : "Presque."}</p>
                      {feedback === "wrong" && <p className="text-sm font-bold text-slate-300">Réponse : {formatExpected(getExpectedAnswer(exercise))}</p>}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <Button className="w-full" size="lg" disabled={!hasAnswer(answer) || feedback !== null || finishing} onClick={submit}>
              {finishing ? "Calcul..." : "Valider"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function getExerciseTone(kind: Exercise["kind"]) {
  if (kind === "multiple-choice" || kind === "review-quiz") {
    return {
      label: "Choix rapide",
      className: "bg-emerald-300 text-slate-950",
      icon: <Check className="h-3.5 w-3.5" />,
    };
  }

  if (kind === "sentence-builder") {
    return {
      label: "Phrase",
      className: "bg-sky-300 text-slate-950",
      icon: <Layers3 className="h-3.5 w-3.5" />,
    };
  }

  if (kind === "match-pairs") {
    return {
      label: "Association",
      className: "bg-amber-300 text-slate-950",
      icon: <Brain className="h-3.5 w-3.5" />,
    };
  }

  return {
    label: "Traduction",
    className: "bg-violet-300 text-slate-950",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  };
}

function StickerCrop() {
  return (
    <div className="absolute right-4 top-3 h-24 w-28 overflow-hidden rounded-2xl">
      <Image
        src={vocabiStickerPackImage}
        alt=""
        width={1254}
        height={1254}
        className="absolute -left-[7.6rem] -top-2 h-[22rem] w-[22rem] max-w-none object-cover opacity-95"
      />
    </div>
  );
}

function ExerciseInput({
  exercise,
  answer,
  onChange,
  disabled,
}: {
  exercise: Exercise;
  answer: string | string[];
  onChange: (answer: string | string[]) => void;
  disabled: boolean;
}) {
  if (exercise.kind === "multiple-choice" || exercise.kind === "review-quiz") {
    return (
      <div className="grid gap-3">
        {exercise.options.map((option) => (
          <motion.button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            whileTap={disabled ? undefined : { scale: 0.985, y: 1 }}
            className={cn(
              "min-h-14 rounded-2xl border px-4 text-left text-base font-extrabold shadow-sm transition",
              answer === option
                ? "border-amber-300 bg-amber-300 text-slate-950 shadow-[0_0_28px_rgba(246,199,86,0.16)]"
                : "border-slate-800 bg-slate-950 text-slate-100",
            )}
          >
            {option}
          </motion.button>
        ))}
      </div>
    );
  }

  if (exercise.kind === "sentence-builder") {
    const selected = Array.isArray(answer) ? answer : [];
    return (
      <div className="space-y-4">
        <div className="min-h-16 rounded-3xl border border-dashed border-amber-300/50 bg-slate-950 p-3">
          <div className="flex flex-wrap gap-2">
            {selected.length === 0 ? <span className="text-sm font-bold text-slate-500">Tape les mots dans l&apos;ordre</span> : selected.map((token, tokenIndex) => (
              <motion.button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange(selected.filter((_, itemIndex) => itemIndex !== tokenIndex))} whileTap={disabled ? undefined : { scale: 0.94 }} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-extrabold text-slate-950 shadow-[0_0_18px_rgba(246,199,86,0.18)]">
                {token}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.tokens.map((token, tokenIndex) => (
            <motion.button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange([...selected, token])} whileTap={disabled ? undefined : { scale: 0.95, y: 1 }} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-extrabold text-slate-100 shadow-sm">
              {token}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (exercise.kind === "match-pairs") {
    const selected = Array.isArray(answer) ? answer : [];
    return (
      <div className="space-y-3">
        {exercise.pairs.map((pair) => {
          const value = `${pair.left}:${pair.right}`;
          const active = selected.includes(value);
          return (
            <motion.button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])}
              whileTap={disabled ? undefined : { scale: 0.985, y: 1 }}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 text-left font-extrabold shadow-sm transition",
                active ? "border-amber-300 bg-amber-300 text-slate-950 shadow-[0_0_28px_rgba(246,199,86,0.16)]" : "border-slate-800 bg-slate-950 text-slate-100",
              )}
            >
              <span>{pair.left}</span>
              <span className="text-slate-400">=</span>
              <span>{pair.right}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <input
      value={typeof answer === "string" ? answer : ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Écris ta réponse..."
      className="h-16 w-full rounded-3xl border border-slate-800 bg-slate-950 px-5 text-lg font-extrabold text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-amber-300 focus:ring-4 focus:ring-amber-300/15"
    />
  );
}

function hasAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0;
}

function formatExpected(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(" ") : answer;
}

function createReviewLesson(queue: ReviewCandidate[]): Lesson | null {
  if (queue.length === 0) {
    return null;
  }

  return {
    id: `review-${todayKey()}`,
    unitId: "review",
    title: "Révision intelligente",
    description: "Une session courte construite depuis tes erreurs et tes échéances de mémoire.",
    estimatedMinutes: Math.max(2, Math.ceil(queue.length * 0.7)),
    difficulty: queue.some((item) => item.mastery.unitId.includes("a2")) ? "A2" : "A1",
    exercises: queue.map((item) => item.exercise),
  };
}

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(`${dateKey}T00:00:00.000Z`));
}








