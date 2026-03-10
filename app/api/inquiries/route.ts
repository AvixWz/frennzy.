import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { checkFixedWindowRateLimit } from "@/lib/rate-limit";
import { createInquiry, inquirySchema } from "@/lib/services/inquiry-service";

function getClientFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown";
  const userAgent = request.headers.get("user-agent")?.trim() || "unknown";

  return `${ip}:${userAgent.slice(0, 80)}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = inquirySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid inquiry payload",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    const rateLimit = checkFixedWindowRateLimit({
      key: `inquiry:${getClientFingerprint(request)}`,
      max: 5,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many submissions. Please try again later.",
          retryAfterSeconds: rateLimit.retryAfterSeconds
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining)
          }
        }
      );
    }

    const inquiry = await createInquiry(parsed.data);

    return NextResponse.json(
      { success: true, inquiry },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining)
        }
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid inquiry payload",
          fieldErrors: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Unable to process inquiry right now." }, { status: 500 });
  }
}
