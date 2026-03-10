import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-card border border-border p-6 shadow-[0_20px_60px_rgba(16,32,56,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
