"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpenCheck,
  Check,
  ChevronRight,
  Flame,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { badgeDefinitions } from "@/data/badges";
import { allLessons, getFirstLesson, units } from "@/data/lessons";
import { errorShake, feedbackVariants, successPulse } from "@/lib/animations/variants";
import { Button } from "@/components/ui/button";
import { BadgePill } from "@/components/ui/badge-pill";
import { Card, SoftCard } from "@/components/ui/card";
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
    <main className="min-h-dvh bg-[linear-gradient(155deg,#f7fee7_0%,#ecfeff_38%,#fff7ed_100%)] text-slate-950">
      <div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-28 pt-4">
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
    <main className="grid min-h-dvh place-items-center bg-emerald-50 px-6 text-slate-950">
      <div className="w-full max-w-sm space-y-4">
        <div className="h-16 w-16 animate-pulse rounded-3xl bg-emerald-300" />
        <div className="h-8 w-40 animate-pulse rounded-full bg-white" />
        <div className="h-32 animate-pulse rounded-3xl bg-white" />
      </div>
    </main>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-rose-50 px-5 text-slate-950">
      <Card className="max-w-sm space-y-4 border-rose-200">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
          <X className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Oups.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
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
    <main className="min-h-dvh bg-[#f8fff7] px-5 py-6 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col justify-between">
        <section className="space-y-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-500 text-white shadow-[0_8px_0_#059669]">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Vocabi</p>
              <h1 className="text-3xl font-black leading-tight">Ton anglais, petit à petit.</h1>
            </div>
          </div>
          <Card className="space-y-5">
            <p className="text-base leading-7 text-slate-700">
              On repart des bases avec des leçons courtes, du feedback direct, de l&apos;XP et une progression gardée sur ton téléphone.
            </p>
            <div className="space-y-3">
              <p className="text-sm font-black text-slate-900">Choisis ton objectif quotidien</p>
              <div className="grid grid-cols-3 gap-2">
                {goalOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGoal(option)}
                    className={cn(
                      "rounded-2xl border p-4 text-center transition active:scale-95",
                      goal === option ? "border-emerald-400 bg-emerald-100 text-emerald-950" : "border-slate-200 bg-white text-slate-600",
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

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
      <header className="flex items-center justify-between gap-4 pt-1">
        <div>
          <p className="text-[0.72rem] font-black uppercase tracking-[0.2em] text-emerald-700">Vocabi</p>
          <h1 className="max-w-[13rem] text-[1.72rem] font-black leading-[1.04] tracking-[-0.01em]">Prêt pour 5 minutes ?</h1>
        </div>
        <VocabiMark />
      </header>

      {lessonResult && <LessonResultCard result={lessonResult} onDismiss={onDismissResult} />}

      <div className="grid grid-cols-3 gap-2.5">
        <Metric icon={<Flame className="h-5 w-5" />} label="Série" value={`${progress.streak}j`} tone="sun" />
        <Metric icon={<Sparkles className="h-5 w-5" />} label="XP" value={progress.totalXp.toString()} tone="mint" />
        <Metric icon={<Trophy className="h-5 w-5" />} label="Leçons" value={progress.completedLessons.toString()} tone="sky" />
      </div>

      <Card className="space-y-4 overflow-hidden border-slate-800 bg-[linear-gradient(145deg,#07111f_0%,#0f172a_64%,#134e4a_100%)] p-4 text-white shadow-[0_18px_38px_rgba(2,6,23,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-200">Objectif du jour</p>
            <h2 className="mt-1 text-[1.7rem] font-black leading-none">{progress.todayXp}/{progress.profile?.dailyGoalXp ?? 30} XP</h2>
          </div>
          <Target className="h-7 w-7 text-amber-300" />
        </div>
        <ProgressBar value={dailyPercent} className="bg-slate-700" />
      </Card>

      <Card className="space-y-4 border-emerald-200/90 bg-white/92 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Prochaine leçon</p>
            <h2 className="truncate text-xl font-black">{nextLesson.title}</h2>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">{nextLesson.description}</p>
        <Button className="w-full" onClick={() => onStartLesson(nextLesson)}>
          Lancer la leçon
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Badges</h2>
          <span className="text-sm font-bold text-slate-500">{progress.badges.length}/{badgeDefinitions.length}</span>
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
    sun: "bg-amber-100 text-amber-900",
    mint: "bg-emerald-100 text-emerald-900",
    sky: "bg-sky-100 text-sky-900",
  }[tone];

  return (
    <SoftCard className="min-h-[5.8rem] p-3">
      <div className={cn("mb-2 grid h-8 w-8 place-items-center rounded-xl", toneClass)}>{icon}</div>
      <p className="text-[1.35rem] font-black leading-none">{value}</p>
      <p className="mt-1 text-[0.72rem] font-bold text-slate-500">{label}</p>
    </SoftCard>
  );
}

function VocabiMark() {
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-slate-950 text-white shadow-[0_8px_0_#334155]">
      <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-300 ring-4 ring-white/80" />
      <span className="text-xl font-black tracking-[-0.04em]">V</span>
    </div>
  );
}

function LessonResultCard({ result, onDismiss }: { result: LessonResult; onDismiss: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <Card className="space-y-4 border-amber-200 bg-amber-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-amber-700">Leçon terminée</p>
            <h2 className="mt-1 text-3xl font-black">+{result.earnedXp} XP</h2>
            <p className="text-sm font-bold text-slate-700">{result.correctAnswers}/{result.totalAnswers} bonnes réponses - {result.score}%</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-amber-300 text-amber-950">
            <Trophy className="h-7 w-7" />
          </div>
        </div>
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
            <p className="text-sm leading-6 text-slate-600">{unit.description}</p>
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
                    "flex w-full items-center gap-4 rounded-[1.25rem] border bg-white p-4 text-left shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition active:scale-[0.99]",
                    locked ? "border-slate-200 opacity-55" : "border-emerald-200 hover:-translate-y-0.5",
                  )}
                >
                  <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", locked ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-700")}>
                    {status === "mastered" || status === "completed" ? <BadgeCheck className="h-6 w-6" /> : <BookOpenCheck className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black">{lesson.title}</h3>
                    <p className="line-clamp-2 text-sm leading-5 text-slate-600">{lesson.description}</p>
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
  const accuracy = useMemo(() => {
    const correct = progress.dailyStats.reduce((sum, day) => sum + day.correctAnswers, 0);
    const total = progress.dailyStats.reduce((sum, day) => sum + day.correctAnswers + day.wrongAnswers, 0);
    return total ? Math.round((correct / total) * 100) : 0;
  }, [progress.dailyStats]);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Progression" title="Tes stats" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="XP total" value={progress.totalXp.toString()} />
        <StatCard label="Précision" value={`${accuracy}%`} />
        <StatCard label="Série" value={`${progress.streak} jour(s)`} />
        <StatCard label="Leçons" value={progress.completedLessons.toString()} />
      </div>
      <Card className="space-y-3">
        <h2 className="text-lg font-black">Activité récente</h2>
        {progress.dailyStats.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">Aucune activité pour l&apos;instant. Une leçon et cette zone prendra vie.</p>
        ) : (
          progress.dailyStats.slice(-5).reverse().map((day) => (
            <div key={day.date} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
              <span className="text-sm font-bold text-slate-700">{day.date}</span>
              <span className="text-sm font-black text-emerald-700">+{day.xp} XP</span>
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

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
      <PageTitle eyebrow="Local-first" title="Profil & sauvegarde" />
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-slate-950 text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black">Données locales</h2>
            <p className="text-sm leading-5 text-slate-600">Ta progression reste sur cet appareil.</p>
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

function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="pt-1">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
      <h1 className="text-3xl font-black tracking-normal">{title}</h1>
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
    <main className="min-h-dvh bg-[#f8fff7] px-4 py-5 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md flex-col">
        <header className="mb-5 flex items-center gap-3">
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-emerald-700">{lesson.title}</p>
            <ProgressBar value={progressValue} />
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
              <Card className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-800">
                    Question {index + 1}/{lesson.exercises.length}
                  </span>
                  <span className="text-sm font-black text-amber-600">+{exercise.xp} XP</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">{exercise.instruction}</p>
                  <h1 className="mt-3 text-3xl font-black leading-tight">{exercise.prompt}</h1>
                </div>
                {exercise.hint && <p className="rounded-2xl bg-sky-50 p-3 text-sm font-bold leading-6 text-sky-900">Indice: {exercise.hint}</p>}
              </Card>
              <ExerciseInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={feedback !== null || finishing} />
            </motion.section>
          </AnimatePresence>

          <div className="sticky bottom-4 space-y-3 pb-[env(safe-area-inset-bottom)]">
            <AnimatePresence>
              {feedback && (
                <motion.div initial="hidden" animate="visible" exit="hidden" variants={feedbackVariants}>
                  <Card className={cn("flex items-center gap-3 p-4", feedback === "correct" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
                    <div className={cn("grid h-10 w-10 place-items-center rounded-2xl text-white", feedback === "correct" ? "bg-emerald-500" : "bg-rose-500")}>
                      {feedback === "correct" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-black">{feedback === "correct" ? "Bien joué !" : "Presque."}</p>
                      {feedback === "wrong" && <p className="text-sm font-bold text-slate-600">Réponse : {formatExpected(getExpectedAnswer(exercise))}</p>}
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
              "min-h-14 rounded-2xl border bg-white px-4 text-left text-base font-extrabold shadow-sm transition active:scale-[0.99]",
              answer === option ? "border-emerald-400 bg-emerald-50 text-emerald-950" : "border-slate-200 text-slate-800",
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
        <div className="min-h-16 rounded-3xl border border-dashed border-emerald-300 bg-white p-3">
          <div className="flex flex-wrap gap-2">
            {selected.length === 0 ? <span className="text-sm font-bold text-slate-400">Tape les mots dans l&apos;ordre</span> : selected.map((token, tokenIndex) => (
              <button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange(selected.filter((_, itemIndex) => itemIndex !== tokenIndex))} className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-extrabold text-emerald-900">
                {token}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.tokens.map((token, tokenIndex) => (
            <button key={`${token}-${tokenIndex}`} type="button" disabled={disabled} onClick={() => onChange([...selected, token])} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 shadow-sm">
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
              className={cn("flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left font-extrabold shadow-sm", active ? "border-emerald-400 bg-emerald-50" : "border-slate-200")}
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
      className="h-16 w-full rounded-3xl border border-slate-200 bg-white px-5 text-lg font-extrabold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
    />
  );
}

function hasAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? answer.length > 0 : answer.trim().length > 0;
}

function formatExpected(answer: string | string[]) {
  return Array.isArray(answer) ? answer.join(" ") : answer;
}




