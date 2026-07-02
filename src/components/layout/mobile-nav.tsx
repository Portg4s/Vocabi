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
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2">
      <div className="grid grid-cols-4 gap-1.5 rounded-[1.65rem] border border-slate-200/70 bg-white/94 p-1.5 shadow-[0_-16px_46px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-[1rem] text-[0.68rem] font-extrabold transition active:scale-95",
                active ? "bg-emerald-100 text-emerald-800 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.16)]" : "text-slate-500 hover:bg-slate-100",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

