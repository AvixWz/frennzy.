"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 rounded-[28px] border border-border bg-white/72 p-2 shadow-[0_18px_40px_rgba(16,32,56,0.08)]">
      {ADMIN_SECTIONS.map((item) => {
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
              isActive
                ? "bg-[linear-gradient(135deg,var(--primary),#3b82f6)] text-white shadow-[0_16px_36px_rgba(15,108,253,0.22)]"
                : "text-muted hover:-translate-y-0.5 hover:bg-white hover:text-foreground"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-white" : "bg-secondary/70")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
