import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listInquiries } from "@/lib/services/admin-service";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const status = (url.searchParams.get("status") as "NEW" | "CONTACTED" | "REVIEWING" | "CLOSED" | null) || undefined;
  const data = await listInquiries(search, status);

  return NextResponse.json(data);
}
