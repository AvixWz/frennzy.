import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,var(--primary),#3b82f6)] text-white shadow-[0_18px_40px_rgba(15,108,253,0.25)] hover:-translate-y-0.5",
  secondary:
    "bg-[linear-gradient(135deg,var(--secondary),#14b8a6)] text-white shadow-[0_18px_40px_rgba(15,163,138,0.2)] hover:-translate-y-0.5",
  ghost:
    "border border-border bg-white/60 text-foreground hover:-translate-y-0.5 hover:bg-white",
  danger:
    "bg-[linear-gradient(135deg,var(--danger),#ef4444)] text-white shadow-[0_18px_40px_rgba(214,65,65,0.24)] hover:-translate-y-0.5"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-soft px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
