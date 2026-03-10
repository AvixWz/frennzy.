import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { getClientIp } from "@/lib/request";
import { createAuditLog } from "@/lib/services/audit-service";

export async function POST(request: Request) {
  const session = await getServerSession();
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  if (session) {
    await createAuditLog({
      action: "LOGOUT",
      entity: "ADMIN_SESSION",
      summary: `Signed out from admin workspace as ${session.email}`,
      adminEmail: session.email,
      ipAddress: getClientIp(request)
    });
  }

  return NextResponse.json({ success: true });
}
