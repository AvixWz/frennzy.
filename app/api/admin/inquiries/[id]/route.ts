import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { updateInquiry } from "@/lib/services/admin-service";
import { createAuditLog } from "@/lib/services/audit-service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const payload = (await request.json()) as { status?: "NEW" | "CONTACTED" | "REVIEWING" | "CLOSED"; notes?: string };

  const updated = await updateInquiry(id, {
    status: payload.status,
    notes: payload.notes
  });

  await createAuditLog({
    action: "UPDATE",
    entity: "INQUIRY",
    entityId: updated.id,
    summary: `Updated inquiry ${updated.name} to ${updated.status}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json(updated);
}
