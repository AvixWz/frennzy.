import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPageSession } from "@/lib/auth/page-guard";

export const metadata: Metadata = {
  title: "Mediway Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminPageSession();

  return (
    <AdminShell
      title="Operations dashboard"
      description="Manage leads, hospitals, doctors, treatments, blog content, and reviews."
      userEmail={session.email}
    >
      {children}
    </AdminShell>
  );
}
