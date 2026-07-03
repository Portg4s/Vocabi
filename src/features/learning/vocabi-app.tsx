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
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Upload,
  X,
  Zap,
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { badgeDefinitions } from "@/data/badges";
import { allLessons, getExerciseById, getFirstLesson, units } from "@/data/lessons";
import { errorShake, feedbackVariants, successPulse } from "@/lib/animations/variants";
import { Button } from "@/components/ui/button";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getExpectedAnswer, isAnswerCorrect } from "@/features/learning/scoring";
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
const lexiconPrismImage = `${basePath}/icons/vocabi-lexicon-prism.png`;
const vocabiAppIconImage = `${basePath}/icons/vocabi-app-icon.png`;
const vocabiAvatarImage = `${basePath}/icons/vocabi-avatar-profile.png`;
const vocabiMarkImage = `${basePath}/icons/vocabi-mark.png`;
const vocabiWordmarkImage = `${basePath}/icons/vocabi-wordmark.png`;

export function VocabiApp() {
  const progress = useVocabiProgress();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
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
            />
          )}
          {activeTab === "lessons" && (
            <LessonsView key="lessons" progress={progress} onStartLesson={(lesson) => setActiveLesson(lesson)} />
          )}
          {activeTab === "stats" && <StatsView key="stats" progress={progress} />}
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
              <Image src={vocabiAppIconImage} alt="" fill sizes="56px" className="object-cover" priority />
            </div>
            <div>
              <Image src={vocabiWordmarkImage} alt="Vocabi" width={180} height={60} className="h-8 w-auto object-contain object-left" priority />
              <h1 className="text-3xl font-black leading-tight">Ta mission anglais commence.</h1>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-amber-300/20 bg-slate-950 shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
            <Image src={lexiconPrismImage} alt="" width={720} height={1080} className="w-full object-cover" style={{ height: "18rem", opacity: 0.86 }} priority />
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
}: {
  progress: ReturnType<typeof useVocabiProgress>;
  lessonResult: LessonResult | null;
  onDismissResult: () => void;
  onStartLesson: (lesson: Lesson) => void;
}) {
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
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4 text-slate-100">
      <header className="flex items-center justify-between gap-4 pt-1">
        <button type="button" aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-300">
          <Layers3 className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <Image src={vocabiWordmarkImage} alt="Vocabi" width={150} height={50} className="h-7 w-auto max-w-[8.5rem] object-contain" priority />
          <h1 className="mt-1 text-sm font-black uppercase tracking-[0.22em] text-slate-100">Daily Mission</h1>
        </div>
        <VocabiMark />
      </header>

      {lessonResult && <LessonResultCard result={lessonResult} onDismiss={onDismissResult} />}

      <section className="relative overflow-hidden rounded-[2rem] border border-amber-300/20 bg-slate-950 shadow-[0_26px_70px_rgba(0,0,0,0.48)]">
        <Image src={lexiconPrismImage} alt="" width={720} height={1080} className="w-full object-cover" style={{ height: "20rem", opacity: 0.82 }} priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.08)_0%,rgba(5,7,11,0.45)_42%,rgba(5,7,11,0.96)_100%)]" />
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

        <div className="relative space-y-4 p-5 pt-0" style={{ marginTop: "-4.5rem" }}>
          <p className="max-w-[18rem] text-sm font-bold leading-6 text-slate-300">{nextLesson.description}</p>

          <div className="grid grid-cols-3 gap-2">
          <Metric icon={<Flame className="h-5 w-5" />} label="Série" value={`${progress.streak}j`} tone="sun" />
          <Metric icon={<Sparkles className="h-5 w-5" />} label="XP" value={progress.totalXp.toString()} tone="mint" />
          <Metric icon={<Trophy className="h-5 w-5" />} label="Leçons" value={progress.completedLessons.toString()} tone="sky" />
          </div>

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
      </section>

      <section className="space-y-4 rounded-[1.6rem] border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_46px_rgba(0,0,0,0.28)] backdrop-blur">
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
              <button
                key={lesson.id}
                type="button"
                disabled={status === "locked"}
                onClick={() => onStartLesson(lesson)}
                className={cn(
                  "relative z-10 flex min-h-16 w-full items-center gap-3 rounded-[1.4rem] px-2 py-2 text-left transition active:scale-[0.99]",
                  active ? "bg-amber-300/10 shadow-[inset_0_0_0_1px_rgba(246,199,86,0.18)]" : "bg-transparent",
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
                {active && <Zap className="h-5 w-5 text-amber-300" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Badges</h2>
          <span className="text-sm font-bold text-slate-400">{progress.badges.length}/{badgeDefinitions.length}</span>
        </div>
        <div className="space-y-2">
          {badgeDefinitions.slice(0, 2).map((badge) => (
            <BadgePill key={badge.id} badge={badge} unlocked={unlockedBadgeIds.has(badge.id)} />
          ))}
        </div>
      </section>
    </motion.section>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: "sun" | "mint" | "sky" }) {
  const toneClass = {
    sun: "bg-amber-300 text-slate-950",
    mint: "bg-emerald-300 text-slate-950",
    sky: "bg-sky-300 text-slate-950",
  }[tone];

  return (
    <div className="min-h-[5.5rem] rounded-[1.15rem] border border-slate-800 bg-slate-900/80 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className={cn("mb-2 grid h-8 w-8 place-items-center rounded-full", toneClass)}>{icon}</div>
      <p className="text-[1.35rem] font-black leading-none text-white">{value}</p>
      <p className="mt-1 text-[0.72rem] font-bold text-slate-400">{label}</p>
    </div>
  );
}

function VocabiMark() {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-amber-300/25 bg-slate-950 shadow-[0_0_24px_rgba(246,199,86,0.16)]">
      <Image src={vocabiMarkImage} alt="Profil Vocabi" fill sizes="48px" className="object-cover" />
      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-emerald-300 ring-4 ring-slate-950" />
    </div>
  );
}

function LessonResultCard({ result, onDismiss }: { result: LessonResult; onDismiss: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <Card className="space-y-4 overflow-hidden border-amber-300/35 bg-[linear-gradient(135deg,rgba(246,199,86,0.18)_0%,rgba(15,23,42,0.92)_100%)] text-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-black uppercase tracking-[0.14em] text-amber-700">
              <Star className="h-4 w-4 fill-amber-300" />
              Leçon terminée
            </p>
            <h2 className="mt-1 text-4xl font-black tracking-normal">+{result.earnedXp} XP</h2>
            <p className="text-sm font-bold text-slate-300">{result.correctAnswers}/{result.totalAnswers} bonnes réponses - {result.score}%</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-amber-300 text-amber-950">
            <Trophy className="h-7 w-7" />
          </div>
        </div>
        <ProgressBar value={result.score} className="bg-white/10" />
        {result.newBadges.length > 0 && <p className="text-sm font-bold text-amber-900">Nouveau badge débloqué !</p>}
        <Button variant="secondary" className="w-full" onClick={onDismiss}>Continuer</Button>
      </Card>
    </motion.div>
  );
}

function LessonsView({ progress, onStartLesson }: { progress: ReturnType<typeof useVocabiProgress>; onStartLesson: (lesson: Lesson) => void }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Parcours" title="Tes unités" />
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
    </motion.section>
  );
}

function StatsView({ progress }: { progress: ReturnType<typeof useVocabiProgress> }) {
  const recentMistakes = useMemo(() => progress.exerciseHistory.filter((item) => !item.correct).slice(-5).reverse(), [progress.exerciseHistory]);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Progression" title="Tes stats" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="XP total" value={progress.totalXp.toString()} />
        <StatCard label="Précision" value={`${progress.accuracy}%`} />
        <StatCard label="Série" value={`${progress.streak} jour(s)`} />
        <StatCard label="Leçons" value={progress.completedLessons.toString()} />
        <StatCard label="Meilleure série" value={`${progress.bestStreak} jour(s)`} />
        <StatCard label="Exercices" value={progress.totalExercises.toString()} />
      </div>
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
        <h2 className="text-lg font-black">À revoir</h2>
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
      await progress.importData(JSON.parse(raw));
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
                setBusy(true);
                await progress.updateDailyGoal(goal);
                setGoalMessage(`Objectif mis à jour : ${goal} XP par jour.`);
                setBusy(false);
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
            const data = await progress.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `vocabi-backup-${new Date().toISOString().slice(0, 10)}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
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
            setBusy(true);
            await progress.resetData();
            setBusy(false);
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
      <div className="relative min-h-44 p-5">
        <Image src={vocabiAvatarImage} alt="" fill sizes="384px" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,11,0.98)_0%,rgba(5,7,11,0.78)_42%,rgba(5,7,11,0.25)_100%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div>
            <Image src={vocabiWordmarkImage} alt="Vocabi" width={170} height={57} className="h-8 w-auto object-contain object-left" />
            <p className="mt-2 max-w-[13rem] text-sm font-bold leading-6 text-slate-300">Ton identité locale reste sur ton appareil.</p>
          </div>
          <div className="grid max-w-[14.5rem] grid-cols-3 gap-2">
            <ProfileMiniStat label="XP" value={progress.totalXp.toString()} />
            <ProfileMiniStat label="Série" value={`${progress.streak}j`} />
            <ProfileMiniStat label="Badges" value={progress.badges.length.toString()} />
          </div>
        </div>
      </div>
    </Card>
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
  onBack,
  onComplete,
}: {
  lesson: Lesson;
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
              <Card className="space-y-4 border-amber-300/18 bg-slate-950 text-slate-100 shadow-[0_24px_58px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em]", exerciseTone.className)}>
                    {exerciseTone.icon}
                    {exerciseTone.label}
                  </span>
                  <span className="text-sm font-black text-amber-300">+{exercise.xp} XP</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">{exercise.instruction}</p>
                  <h1 className="mt-3 text-[2rem] font-black leading-tight tracking-normal">{exercise.prompt}</h1>
                </div>
                {exercise.hint && <p className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-3 text-sm font-bold leading-6 text-sky-100">Indice: {exercise.hint}</p>}
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
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "min-h-14 rounded-2xl border px-4 text-left text-base font-extrabold shadow-sm transition active:scale-[0.99]",
              answer === option ? "border-amber-300 bg-amber-300 text-slate-950" : "border-slate-800 bg-slate-950 text-slate-100",
            )}
          >
            {option}
          </button>
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
              <button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange(selected.filter((_, itemIndex) => itemIndex !== tokenIndex))} className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-extrabold text-slate-950">
                {token}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.tokens.map((token, tokenIndex) => (
            <button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange([...selected, token])} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-extrabold text-slate-100 shadow-sm">
              {token}
            </button>
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
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(active ? selected.filter((item) => item !== value) : [...selected, value])}
              className={cn("flex w-full items-center justify-between rounded-2xl border p-4 text-left font-extrabold shadow-sm", active ? "border-amber-300 bg-amber-300 text-slate-950" : "border-slate-800 bg-slate-950 text-slate-100")}
            >
              <span>{pair.left}</span>
              <span className="text-slate-400">=</span>
              <span>{pair.right}</span>
            </button>
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








