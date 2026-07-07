import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-white/10 bg-slate-950 p-5 text-slate-100 shadow-[0_18px_46px_rgba(0,0,0,0.28)]",
        className,
      )}
      {...props}
    />
  );
}

export function SoftCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-white/10 bg-slate-950/80 p-4 text-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.24)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
