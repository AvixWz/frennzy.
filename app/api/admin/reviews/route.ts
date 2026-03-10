import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { listTestimonials, saveTestimonial } from "@/lib/services/admin-service";
import { createAuditLog } from "@/lib/services/audit-service";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || undefined;
  const data = await listTestimonials(search);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await request.json();
  const review = await saveTestimonial(payload);

  await createAuditLog({
    action: payload.id ? "UPDATE" : "CREATE",
    entity: "TESTIMONIAL",
    entityId: review.id,
    summary: `${payload.id ? "Updated" : "Created"} testimonial for ${review.patientName}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json(review);
}
