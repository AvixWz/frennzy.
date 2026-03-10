import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { listReferenceData } from "@/lib/services/admin-service";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const data = await listReferenceData();
  return NextResponse.json(data);
}
