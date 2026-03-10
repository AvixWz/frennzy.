import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { checkFixedWindowRateLimit } from "@/lib/rate-limit";
import { getClientFingerprint, getClientIp } from "@/lib/request";
import { createAuditLog } from "@/lib/services/audit-service";

export async function POST(request: Request) {
  const rateLimit = checkFixedWindowRateLimit({
    key: `admin-login:${getClientFingerprint(request)}`,
    max: 8,
    windowMs: 15 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please try again later.",
        retryAfterSeconds: rateLimit.retryAfterSeconds
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: body.email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await comparePassword(body.password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, sessionCookieOptions());

  await createAuditLog({
    action: "LOGIN",
    entity: "ADMIN_SESSION",
    summary: `Signed in to admin workspace as ${user.email}`,
    adminEmail: user.email,
    ipAddress: getClientIp(request)
  });

  return NextResponse.json({ success: true, role: user.role });
}
