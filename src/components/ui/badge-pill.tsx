import { BookOpen, Flame, Sparkles, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/types/learning";

const iconMap = {
  sparkles: Sparkles,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  book: BookOpen,
};

export function BadgePill({ badge, unlocked = false }: { badge: BadgeDefinition; unlocked?: boolean }) {
  const Icon = iconMap[badge.icon];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[1.15rem] border p-3 transition",
        unlocked
          ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-950 shadow-[0_10px_24px_rgba(245,158,11,0.14)]"
          : "border-slate-200/80 bg-white/78 text-slate-500 shadow-[0_8px_22px_rgba(15,23,42,0.045)]",
      )}
    >
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]", unlocked ? "bg-amber-200 text-amber-950" : "bg-slate-100 text-slate-500")}> 
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold leading-5">{badge.title}</span>
        <span className="block text-xs leading-5">{badge.description}</span>
      </span>
    </div>
  );
}
