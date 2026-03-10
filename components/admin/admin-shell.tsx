import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";

interface AdminShellProps {
  title: string;
  description: string;
  userEmail: string;
  children: ReactNode;
}

export function AdminShell({ title, description, userEmail, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,108,253,0.15),transparent_24%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.12),transparent_20%),linear-gradient(180deg,#f6f9ff_0%,#eef5ff_100%)]">
      <header className="border-b border-border bg-white/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.4fr,0.6fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                <Sparkles className="h-4 w-4" />
                Hidden Admin Workspace
              </p>
              <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-border bg-white/88 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Signed in</p>
                <p className="mt-2 truncate text-sm font-semibold">{userEmail}</p>
              </div>
              <div className="flex items-center justify-between rounded-card border border-border bg-white/88 p-4 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Workspace</p>
                  <p className="mt-2 text-sm font-semibold">Protected admin</p>
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
