import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]", className)} aria-label={`Progression ${safeValue}%`}>
      <div
        className="vocabi-progress-fill h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-300 transition-all duration-500 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
