import { BarChart3, BookOpenCheck, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "lessons" | "stats" | "profile";

const items: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "lessons", label: "Leçons", icon: BookOpenCheck },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "profile", label: "Profil", icon: UserRound },
];

export function MobileNav({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 px-4 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2">
      <div className="grid h-[4.25rem] grid-cols-4 gap-1 rounded-[1.45rem] border border-white/10 bg-slate-950/94 p-1 shadow-[0_-16px_46px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative flex min-h-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[1.05rem] text-[0.68rem] font-extrabold leading-none transition active:scale-95",
                active
                  ? "bg-amber-300 text-slate-950 shadow-[0_6px_18px_rgba(246,199,86,0.16),inset_0_1px_0_rgba(255,255,255,0.34)]"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-200",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

