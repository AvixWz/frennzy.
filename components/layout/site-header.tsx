"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/treatments", label: "Treatments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/blog", label: "Blog" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Consultation" }
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="rounded-2xl bg-[linear-gradient(135deg,var(--primary),#3b82f6)] p-2.5 text-white shadow-[0_18px_40px_rgba(15,108,253,0.28)]">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <span className="block text-lg font-semibold tracking-tight">Mediway</span>
            <span className="block text-[11px] uppercase tracking-[0.26em] text-muted">Medical travel</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-semibold transition duration-200",
                  isActive ? "bg-primary text-white shadow-[0_14px_30px_rgba(15,108,253,0.22)]" : "text-muted hover:-translate-y-0.5 hover:bg-white hover:text-foreground"
                )}
              >
                {item.label}
                {!isActive ? (
                  <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-primary transition duration-200 group-hover:scale-x-100" />
                ) : null}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--secondary),#14b8a6)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,163,138,0.22)] transition hover:-translate-y-0.5"
          >
            Free assessment
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-soft border border-border bg-white/75"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("md:hidden", open ? "block" : "hidden")}>
        <nav className="space-y-2 border-t border-border px-4 py-4 sm:px-6">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-soft px-4 py-3 text-sm font-semibold transition",
                  isActive ? "bg-primary text-white" : "bg-white/70 text-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="block rounded-soft bg-[linear-gradient(135deg,var(--secondary),#14b8a6)] px-4 py-3 text-sm font-semibold text-white"
          >
            Free assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}
