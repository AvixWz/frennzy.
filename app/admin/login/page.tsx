import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getServerSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin Login | Mediway",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage() {
  const session = await getServerSession();
  if (session?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(15,108,253,0.16),transparent_25%),radial-gradient(circle_at_right,rgba(20,184,166,0.14),transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-12">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl gap-10 lg:grid-cols-[1fr,420px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Secure admin access</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight">
            Operate content, leads, analytics, and audit history from one workspace.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted">
            This access point is hidden from public navigation, uncached, and protected with encrypted sessions and login throttling.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </section>
  );
}
