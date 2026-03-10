import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { getClientIp } from "@/lib/request";
import { createAuditLog } from "@/lib/services/audit-service";

export const runtime = "nodejs";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, and GIF images are allowed." }, { status: 400 });
  }

  if (file.size > maxBytes) {
    return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const target = path.join(uploadDir, fileName);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(target, buffer);

  const url = `/uploads/${fileName}`;

  await createAuditLog({
    action: "UPLOAD",
    entity: "MEDIA",
    entityId: fileName,
    summary: `Uploaded media asset ${file.name}`,
    adminEmail: auth.session.email,
    ipAddress: getClientIp(request),
    metadata: {
      fileName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type
    }
  });

  return NextResponse.json({ url });
}
