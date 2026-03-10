"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

type ReferenceItem = {
  id: string;
  name: string;
};

type ReviewRecord = {
  id: string;
  patientName: string;
  country: string;
  city?: string | null;
  treatment: string;
  comment: string;
  rating: number;
  imageUrl?: string | null;
  isPublished: boolean;
  doctorId?: string | null;
  treatmentId?: string | null;
};

type ReviewFormState = {
  id?: string;
  patientName: string;
  country: string;
  city: string;
  treatment: string;
  comment: string;
  rating: string;
  imageUrl: string;
  isPublished: boolean;
  doctorId: string;
  treatmentId: string;
};

const createEmptyState = (): ReviewFormState => ({
  patientName: "",
  country: "",
  city: "",
  treatment: "",
  comment: "",
  rating: "5",
  imageUrl: "",
  isPublished: true,
  doctorId: "",
  treatmentId: ""
});

function toFormState(item: ReviewRecord): ReviewFormState {
  return {
    id: item.id,
    patientName: item.patientName,
    country: item.country,
    city: item.city || "",
    treatment: item.treatment,
    comment: item.comment,
    rating: String(item.rating),
    imageUrl: item.imageUrl || "",
    isPublished: item.isPublished,
    doctorId: item.doctorId || "",
    treatmentId: item.treatmentId || ""
  };
}

interface ReviewsManagerProps {
  initialReviews: ReviewRecord[];
  doctors: ReferenceItem[];
  treatments: ReferenceItem[];
}

export function ReviewsManager({ initialReviews, doctors, treatments }: ReviewsManagerProps) {
  const [items, setItems] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ReviewFormState>(createEmptyState());
  const [saving, setSaving] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.patientName, item.country, item.treatment].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  function resetForm() {
    setForm(createEmptyState());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      id: form.id,
      patientName: form.patientName,
      country: form.country,
      city: form.city || undefined,
      treatment: form.treatment,
      comment: form.comment,
      rating: Number(form.rating || 5),
      imageUrl: form.imageUrl || undefined,
      isPublished: form.isPublished,
      doctorId: form.doctorId || undefined,
      treatmentId: form.treatmentId || undefined
    };

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const saved = (await response.json()) as ReviewRecord;
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
    const confirmed = window.confirm("Delete this review?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Reviews</h2>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>
        <Input placeholder="Search reviews" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setForm(toFormState(item))}
              className="w-full rounded-soft border border-border bg-bg p-4 text-left transition hover:border-primary/40"
            >
              <p className="font-semibold">{item.patientName}</p>
              <p className="text-sm text-muted">{item.country}</p>
              <p className="text-xs text-muted">{item.treatment}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Patient name</label>
              <Input value={form.patientName} onChange={(event) => setForm({ ...form, patientName: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Country</label>
              <Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Treatment label</label>
              <Input value={form.treatment} onChange={(event) => setForm({ ...form, treatment: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Rating</label>
              <Input type="number" min={1} max={5} value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Image URL</label>
              <Input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Linked doctor</label>
              <select
                value={form.doctorId}
                onChange={(event) => setForm({ ...form, doctorId: event.target.value })}
                className="w-full rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
              >
                <option value="">No doctor link</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Linked treatment</label>
              <select
                value={form.treatmentId}
                onChange={(event) => setForm({ ...form, treatmentId: event.target.value })}
                className="w-full rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
              >
                <option value="">No treatment link</option>
                {treatments.map((treatment) => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 rounded-soft border border-border p-3 text-sm font-medium">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />
              Published
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Comment</label>
            <Textarea rows={5} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} required />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update review" : "Create review"}
            </Button>
            {form.id ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(form.id!)}>
                Delete review
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
