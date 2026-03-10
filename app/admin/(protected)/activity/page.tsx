import { Card } from "@/components/ui/card";
import { listAuditLogs } from "@/lib/services/admin-service";

export default async function AdminActivityPage() {
  const logs = await listAuditLogs(80);

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Audit trail</p>
        <h1 className="mt-3 text-3xl font-semibold">Activity and change history</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Review who changed what across content, inquiries, media uploads, and admin sessions.
        </p>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <div className="grid min-w-[820px] grid-cols-[140px,140px,1fr,180px,180px] gap-3 border-b border-border bg-bg/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <span>Action</span>
            <span>Entity</span>
            <span>Summary</span>
            <span>Admin</span>
            <span>When</span>
          </div>
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="grid min-w-[820px] grid-cols-[140px,140px,1fr,180px,180px] gap-3 px-6 py-4 text-sm">
                <span className="font-semibold text-secondary">{log.action}</span>
                <span className="font-semibold">{log.entity}</span>
                <span>{log.summary}</span>
                <span className="text-muted">{log.adminEmail}</span>
                <span className="text-muted">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
