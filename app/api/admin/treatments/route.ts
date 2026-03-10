import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { listTreatments, saveTreatment } from "@/lib/services/admin-service";
import { createAuditLog } from "@/lib/services/audit-service";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const data = await listTreatments(search);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await request.json();
  const treatment = await saveTreatment(payload);

  await createAuditLog({
    action: payload.id ? "UPDATE" : "CREATE",
    entity: "TREATMENT",
    entityId: treatment.id,
    summary: `${payload.id ? "Updated" : "Created"} treatment page for ${treatment.name}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json(treatment);
}
