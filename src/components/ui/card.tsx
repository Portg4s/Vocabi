import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]",
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
        "rounded-[1.25rem] border border-white/80 bg-white/70 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.07)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
