import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[1.15rem] px-5 text-sm font-extrabold transition-[background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
  {
    variants: {
      variant: {
        primary: "border border-emerald-200/20 bg-emerald-500 text-white shadow-[0_7px_0_#047857,0_16px_30px_rgba(16,185,129,0.16)] hover:bg-emerald-400",
        secondary: "border border-white/10 bg-slate-900/92 text-slate-100 shadow-[0_5px_0_#020617,inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-300/24 hover:bg-slate-800",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
        danger: "border border-rose-200/20 bg-rose-600 text-white shadow-[0_7px_0_#7f1d1d,0_16px_30px_rgba(225,29,72,0.16)] hover:bg-rose-500",
      },
      size: {
        default: "h-12",
        sm: "h-10 rounded-xl px-3 text-xs",
        lg: "h-[3.25rem] rounded-[1.35rem] px-6 text-base",
        icon: "h-12 w-12 rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);

Button.displayName = "Button";

