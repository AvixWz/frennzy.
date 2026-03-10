export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

export function getClientFingerprint(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent")?.trim() || "unknown";
  return `${ip}:${userAgent.slice(0, 80)}`;
}
