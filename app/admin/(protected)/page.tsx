import { Card } from "@/components/ui/card";
import { getAdminStats } from "@/lib/services/admin-service";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "Inquiries", value: stats.inquiries, note: "Patient lead pipeline" },
    { label: "Doctors", value: stats.doctors, note: "Specialist profiles" },
    { label: "Hospitals", value: stats.hospitals, note: "Partner facilities" },
    { label: "Treatments", value: stats.treatments, note: "Treatment landing pages" },
    { label: "Blog posts", value: stats.blogPosts, note: "Searchable editorial assets" }
  ];

  const maxTrend = Math.max(...stats.inquiriesTrend.map((item) => item.value), 1);
  const maxStatus = Math.max(...stats.inquiryStatusCounts.map((item) => item.value), 1);
  const maxCity = Math.max(...stats.doctorCityCounts.map((item) => item.value), 1);
  const maxCategory = Math.max(...stats.treatmentCategoryCounts.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#ffffff,rgba(241,247,255,0.96))]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Admin command center</p>
            <h2 className="mt-3 text-3xl font-semibold">Professional content, tighter security, cleaner operations</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              This workspace now tracks operational activity, caches public traffic more efficiently, and keeps admin-side
              actions auditable.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Security</p>
              <p className="mt-2 text-lg font-semibold">Encrypted admin sessions</p>
              <p className="mt-1 text-sm text-muted">HTTP-only cookies, login throttling, no-store admin responses.</p>
            </div>
            <div className="rounded-card border border-border bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Performance</p>
              <p className="mt-2 text-lg font-semibold">Smarter response caching</p>
              <p className="mt-1 text-sm text-muted">Public routes are cache-friendly, admin routes stay uncached.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        {statCards.map((item) => (
          <Card key={item.label} className="bg-white/82">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-sm text-muted">{item.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Inquiry trend</h2>
          <div className="mt-5 grid grid-cols-7 gap-3">
            {stats.inquiriesTrend.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end rounded-soft bg-bg/80 p-2">
                  <div
                    className="w-full rounded-soft bg-[linear-gradient(180deg,var(--secondary),#14b8a6)]"
                    style={{ height: `${Math.max(14, (item.value / maxTrend) * 100)}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-foreground">{item.value}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Inquiry status mix</h2>
          <div className="mt-5 space-y-4">
            {stats.inquiryStatusCounts.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-muted">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-bg">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(135deg,var(--primary),#3b82f6)]"
                    style={{ width: `${Math.max(12, (item.value / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <h2 className="text-xl font-semibold">Doctors by city</h2>
          <div className="mt-5 space-y-4">
            {stats.doctorCityCounts.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-muted">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-bg">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(135deg,#0f6cfd,#60a5fa)]"
                    style={{ width: `${Math.max(12, (item.value / maxCity) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-1">
          <h2 className="text-xl font-semibold">Treatments by category</h2>
          <div className="mt-5 space-y-4">
            {stats.treatmentCategoryCounts.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-muted">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-bg">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(135deg,#14b8a6,#2dd4bf)]"
                    style={{ width: `${Math.max(12, (item.value / maxCategory) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-1">
          <h2 className="text-xl font-semibold">Recent audit activity</h2>
          <div className="mt-4 space-y-3">
            {stats.recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-soft border border-border bg-bg p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                    {log.action} {log.entity}
                  </p>
                  <p className="text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm font-semibold">{log.summary}</p>
                <p className="mt-1 text-xs text-muted">{log.adminEmail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Recent inquiries</h2>
        <div className="mt-4 space-y-3">
          {stats.recentLeads.map((lead) => (
            <div key={lead.id} className="rounded-soft border border-border bg-bg p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-muted">
                    {lead.email} | {lead.country} | {lead.treatmentInterest}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary">{lead.status}</p>
              </div>
              <p className="mt-2 text-sm text-muted">{lead.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
