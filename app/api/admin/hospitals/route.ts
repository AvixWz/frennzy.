import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { listHospitals, saveHospital } from "@/lib/services/admin-service";
import { createAuditLog } from "@/lib/services/audit-service";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const data = await listHospitals(search);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await request.json();
  const hospital = await saveHospital(payload);

  await createAuditLog({
    action: payload.id ? "UPDATE" : "CREATE",
    entity: "HOSPITAL",
    entityId: hospital.id,
    summary: `${payload.id ? "Updated" : "Created"} hospital listing for ${hospital.name}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json(hospital);
}
