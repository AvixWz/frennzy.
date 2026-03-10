"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { parseDelimitedList, safeParseJson } from "@/lib/utils";

type ReferenceItem = {
  id: string;
  name: string;
};

type TreatmentRecord = {
  id: string;
  name: string;
  slug: string;
  category: string;
  images?: string[] | null;
  procedure: string;
  recovery: string;
  costMin: number;
  costMax: number;
  currency: string;
  faqs: Array<{ question: string; answer: string }>;
  seoTitle?: string | null;
  seoDescription?: string | null;
  doctorTreatments: Array<{ doctor: ReferenceItem }>;
  hospitalTreatments: Array<{ hospital: ReferenceItem }>;
};

type TreatmentFormState = {
  id?: string;
  name: string;
  category: string;
  imagesText: string;
  procedure: string;
  recovery: string;
  costMin: string;
  costMax: string;
  currency: string;
  faqsText: string;
  doctorIds: string[];
  hospitalIds: string[];
  seoTitle: string;
  seoDescription: string;
};

const emptyFaqJson = JSON.stringify([{ question: "What should patients prepare?", answer: "Share reports and travel dates." }], null, 2);

const createEmptyState = (): TreatmentFormState => ({
  name: "",
  category: "",
  imagesText: "",
  procedure: "",
  recovery: "",
  costMin: "",
  costMax: "",
  currency: "USD",
  faqsText: emptyFaqJson,
  doctorIds: [],
  hospitalIds: [],
  seoTitle: "",
  seoDescription: ""
});

function toFormState(item: TreatmentRecord): TreatmentFormState {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    imagesText: item.images?.join(", ") || "",
    procedure: item.procedure,
    recovery: item.recovery,
    costMin: String(item.costMin),
    costMax: String(item.costMax),
    currency: item.currency,
    faqsText: JSON.stringify(item.faqs, null, 2),
    doctorIds: item.doctorTreatments.map((entry) => entry.doctor.id),
    hospitalIds: item.hospitalTreatments.map((entry) => entry.hospital.id),
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || ""
  };
}

interface TreatmentsManagerProps {
  initialTreatments: TreatmentRecord[];
  doctors: ReferenceItem[];
  hospitals: ReferenceItem[];
}

export function TreatmentsManager({ initialTreatments, doctors, hospitals }: TreatmentsManagerProps) {
  const [items, setItems] = useState(initialTreatments);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<TreatmentFormState>(createEmptyState());
  const [saving, setSaving] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.name, item.category].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  function resetForm() {
    setForm(createEmptyState());
  }

  function toggleSelection(key: "doctorIds" | "hospitalIds", id: string) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      id: form.id,
      name: form.name,
      category: form.category,
      images: parseDelimitedList(form.imagesText),
      procedure: form.procedure,
      recovery: form.recovery,
      costMin: Number(form.costMin || 0),
      costMax: Number(form.costMax || 0),
      currency: form.currency,
      faqs: safeParseJson(form.faqsText, [] as Array<{ question: string; answer: string }>),
      doctorIds: form.doctorIds,
      hospitalIds: form.hospitalIds,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined
    };

    try {
      const response = await fetch("/api/admin/treatments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const saved = (await response.json()) as TreatmentRecord;
      setItems((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setForm(toFormState(saved));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this treatment?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/treatments/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setItems((current) => current.filter((item) => item.id !== id));
    if (form.id === id) {
      resetForm();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Treatments</h2>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>
        <Input placeholder="Search treatments" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setForm(toFormState(item))}
              className="w-full rounded-soft border border-border bg-bg p-4 text-left transition hover:border-primary/40"
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted">{item.category}</p>
              <p className="text-xs text-muted">
                {item.doctorTreatments.length} doctors • {item.hospitalTreatments.length} hospitals
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Treatment name</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Image URLs</label>
              <Textarea rows={3} value={form.imagesText} onChange={(event) => setForm({ ...form, imagesText: event.target.value })} placeholder="One URL per line or comma separated" />
              <div className="mt-3">
                <ImageUploadField
                  onUploaded={(url) =>
                    setForm((current) => ({
                      ...current,
                      imagesText: current.imagesText ? `${current.imagesText}, ${url}` : url
                    }))
                  }
                  helperText="Upload treatment image"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Minimum cost</label>
              <Input type="number" value={form.costMin} onChange={(event) => setForm({ ...form, costMin: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Maximum cost</label>
              <Input type="number" value={form.costMax} onChange={(event) => setForm({ ...form, costMax: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Currency</label>
              <Input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} required />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Procedure</label>
            <Textarea rows={5} value={form.procedure} onChange={(event) => setForm({ ...form, procedure: event.target.value })} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Recovery</label>
            <Textarea rows={4} value={form.recovery} onChange={(event) => setForm({ ...form, recovery: event.target.value })} required />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">FAQ JSON</label>
            <Textarea rows={8} value={form.faqsText} onChange={(event) => setForm({ ...form, faqsText: event.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Linked doctors</label>
              <div className="grid gap-2">
                {doctors.map((doctor) => (
                  <label key={doctor.id} className="flex items-center gap-2 rounded-soft border border-border p-3 text-sm">
                    <input type="checkbox" checked={form.doctorIds.includes(doctor.id)} onChange={() => toggleSelection("doctorIds", doctor.id)} />
                    <span>{doctor.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Linked hospitals</label>
              <div className="grid gap-2">
                {hospitals.map((hospital) => (
                  <label key={hospital.id} className="flex items-center gap-2 rounded-soft border border-border p-3 text-sm">
                    <input type="checkbox" checked={form.hospitalIds.includes(hospital.id)} onChange={() => toggleSelection("hospitalIds", hospital.id)} />
                    <span>{hospital.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">SEO title</label>
              <Input value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">SEO description</label>
              <Input value={form.seoDescription} onChange={(event) => setForm({ ...form, seoDescription: event.target.value })} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update treatment" : "Create treatment"}
            </Button>
            {form.id ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(form.id!)}>
                Delete treatment
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
