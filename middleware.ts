import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";

const adminPaths = ["/admin", "/api/admin"];

function applyCommonHeaders(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  const isApiPath = pathname.startsWith("/api");
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  if (isAdminPath || isApiPath) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
  } else {
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  }

  if (isAdminPath) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (isAdminPath && pathname !== "/admin/login" && pathname !== "/api/auth/login") {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return applyCommonHeaders(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
      }
      return applyCommonHeaders(request, NextResponse.redirect(new URL("/admin/login", request.url)));
    }
  }

  return applyCommonHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
