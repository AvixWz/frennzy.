"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mediway.com");
  const [password, setPassword] = useState("ChangeThisStrongPassword123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to log in right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/88">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Private access</p>
      <h1 className="mt-3 text-3xl font-semibold">Admin login</h1>
      <p className="mt-2 text-sm text-muted">This route is intentionally hidden from public navigation and search indexing.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </form>
    </Card>
  );
}
