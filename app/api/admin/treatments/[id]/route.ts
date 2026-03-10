import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { deleteTreatment } from "@/lib/services/admin-service";
import { createAuditLog } from "@/lib/services/audit-service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const treatment = await deleteTreatment(id);

  await createAuditLog({
    action: "DELETE",
    entity: "TREATMENT",
    entityId: treatment.id,
    summary: `Deleted treatment page for ${treatment.name}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json({ success: true });
}
