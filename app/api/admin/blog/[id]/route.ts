import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { deleteBlogPost } from "@/lib/services/admin-service";
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
  const post = await deleteBlogPost(id);

  await createAuditLog({
    action: "DELETE",
    entity: "BLOG_POST",
    entityId: post.id,
    summary: `Deleted blog post "${post.title}"`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json({ success: true });
}
