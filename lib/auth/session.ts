import { createHash } from "crypto";
import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "EDITOR";
}

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment.");
  }
  return createHash("sha256").update(encoder.encode(secret)).digest();
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp" | "iat">) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .encrypt(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtDecrypt(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 12,
    path: "/"
  };
}
