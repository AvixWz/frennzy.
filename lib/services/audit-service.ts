import { prisma } from "@/lib/prisma";

interface AuditLogInput {
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
  adminEmail: string;
  ipAddress?: string | null;
  metadata?: unknown;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId || undefined,
        summary: input.summary,
        adminEmail: input.adminEmail,
        ipAddress: input.ipAddress || undefined,
        metadata: input.metadata as never
      }
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}
