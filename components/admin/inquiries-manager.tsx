"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

type InquiryRecord = {
  id: string;
  name: string;
  country: string;
  phone: string;
  email: string;
  treatmentInterest: string;
  message: string;
  status: "NEW" | "CONTACTED" | "REVIEWING" | "CLOSED";
  notes: string | null;
  createdAt: string;
};

interface InquiriesManagerProps {
  initialInquiries: InquiryRecord[];
}

const statuses = ["NEW", "CONTACTED", "REVIEWING", "CLOSED"] as const;

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [items, setItems] = useState(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      [item.name, item.email, item.country, item.treatmentInterest].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function updateItem(id: string, payload: { status?: InquiryRecord["status"]; notes?: string }) {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const updated = (await response.json()) as InquiryRecord;
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Search inquiries" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <div className="flex items-center text-sm text-muted">{filteredItems.length} inquiry records</div>
      </Card>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col justify-between gap-4 lg:flex-row">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{item.status}</span>
                </div>
                <p className="text-sm text-muted">
                  {item.email} • {item.phone} • {item.country}
                </p>
                <p className="text-sm font-medium">{item.treatmentInterest}</p>
                <p className="text-sm text-muted">{item.message}</p>
              </div>
              <div className="grid min-w-[280px] gap-3">
                <select
                  defaultValue={item.status}
                  onChange={(event) => updateItem(item.id, { status: event.target.value as InquiryRecord["status"] })}
                  className="rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
                  disabled={savingId === item.id}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Textarea
                  rows={4}
                  defaultValue={item.notes || ""}
                  placeholder="Internal notes"
                  onBlur={(event) => updateItem(item.id, { notes: event.target.value })}
                />
                <div className="text-xs text-muted">
                  Created {new Date(item.createdAt).toLocaleString()}
                  {savingId === item.id ? " • Saving..." : ""}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
