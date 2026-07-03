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
          ? "border-amber-300/45 bg-gradient-to-br from-amber-300/20 to-slate-950 text-amber-50 shadow-[0_0_30px_rgba(246,199,86,0.16)]"
          : "border-slate-800 bg-slate-950 text-slate-400 shadow-[0_12px_28px_rgba(0,0,0,0.2)]",
      )}
    >
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[0.9rem]", unlocked ? "bg-amber-300 text-slate-950" : "bg-slate-900 text-slate-500")}> 
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold leading-5">{badge.title}</span>
        <span className="block text-xs leading-5">{badge.description}</span>
      </span>
    </div>
  );
}
