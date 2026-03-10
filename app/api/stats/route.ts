import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/services/public-service";

export async function GET() {
  const stats = await getPublicStats();
  return NextResponse.json(stats);
}
