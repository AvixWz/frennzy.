import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true as const,
    session
  };
}
