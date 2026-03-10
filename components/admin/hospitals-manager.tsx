"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { parseDelimitedList, stringifyDelimitedList } from "@/lib/utils";

type ReferenceItem = {
  id: string;
  name: string;
};

type HospitalRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  overview: string;
  googleReviewUrl?: string | null;
  websiteUrl?: string | null;
  contactEmail: string;
  contactPhone: string;
  accreditations: string[];
  departments: string[];
  facilities: string[];
  images: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  hospitalTreatments: Array<{ treatment: ReferenceItem }>;
  doctors: Array<{ id: string }>;
};

type HospitalFormState = {
  id?: string;
  name: string;
  city: string;
  country: string;
  overview: string;
  googleReviewUrl: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  accreditationsText: string;
  departmentsText: string;
  facilitiesText: string;
  imagesText: string;
  treatmentIds: string[];
  seoTitle: string;
  seoDescription: string;
};

const createEmptyState = (): HospitalFormState => ({
  name: "",
  city: "",
  country: "India",
  overview: "",
  googleReviewUrl: "",
  websiteUrl: "",
  contactEmail: "",
  contactPhone: "",
  accreditationsText: "",
  departmentsText: "",
  facilitiesText: "",
  imagesText: "",
  treatmentIds: [],
  seoTitle: "",
  seoDescription: ""
});

function toFormState(item: HospitalRecord): HospitalFormState {
  return {
    id: item.id,
    name: item.name,
    city: item.city,
    country: item.country,
    overview: item.overview,
    googleReviewUrl: item.googleReviewUrl || "",
    websiteUrl: item.websiteUrl || "",
    contactEmail: item.contactEmail,
    contactPhone: item.contactPhone,
    accreditationsText: stringifyDelimitedList(item.accreditations),
    departmentsText: stringifyDelimitedList(item.departments),
    facilitiesText: stringifyDelimitedList(item.facilities),
    imagesText: stringifyDelimitedList(item.images),
    treatmentIds: item.hospitalTreatments.map((entry) => entry.treatment.id),
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || ""
  };
}

interface HospitalsManagerProps {
  initialHospitals: HospitalRecord[];
  treatments: ReferenceItem[];
}

export function HospitalsManager({ initialHospitals, treatments }: HospitalsManagerProps) {
  const [items, setItems] = useState(initialHospitals);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<HospitalFormState>(createEmptyState());
  const [saving, setSaving] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.name, item.city, item.country].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  function resetForm() {
    setForm(createEmptyState());
  }

  function toggleTreatment(id: string) {
    setForm((current) => ({
      ...current,
      treatmentIds: current.treatmentIds.includes(id)
        ? current.treatmentIds.filter((item) => item !== id)
        : [...current.treatmentIds, id]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      id: form.id,
      name: form.name,
      city: form.city,
      country: form.country,
      overview: form.overview,
      googleReviewUrl: form.googleReviewUrl || undefined,
      websiteUrl: form.websiteUrl || undefined,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      accreditations: parseDelimitedList(form.accreditationsText),
      departments: parseDelimitedList(form.departmentsText),
      facilities: parseDelimitedList(form.facilitiesText),
      images: parseDelimitedList(form.imagesText),
      treatmentIds: form.treatmentIds,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined
    };

    try {
      const response = await fetch("/api/admin/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const saved = (await response.json()) as HospitalRecord;
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
    const confirmed = window.confirm("Delete this hospital?");
    if (!confirmed) return;

    const response = await fetch(`/api/admin/hospitals/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Hospitals</h2>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>
        <Input placeholder="Search hospitals" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setForm(toFormState(item))}
              className="w-full rounded-soft border border-border bg-bg p-4 text-left transition hover:border-primary/40"
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted">
                {item.city}, {item.country}
              </p>
              <p className="mt-1 text-xs text-muted">{item.doctors.length} doctors</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Hospital name</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Country</label>
              <Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Contact email</label>
              <Input type="email" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Google review URL</label>
              <Input value={form.googleReviewUrl} onChange={(event) => setForm({ ...form, googleReviewUrl: event.target.value })} placeholder="https://www.google.com/search?..." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Website URL</label>
              <Input value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} placeholder="https://hospital.example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Contact phone</label>
              <Input value={form.contactPhone} onChange={(event) => setForm({ ...form, contactPhone: event.target.value })} required />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Overview</label>
            <Textarea rows={5} value={form.overview} onChange={(event) => setForm({ ...form, overview: event.target.value })} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Accreditations</label>
              <Textarea rows={4} value={form.accreditationsText} onChange={(event) => setForm({ ...form, accreditationsText: event.target.value })} placeholder="JCI, NABH" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Departments</label>
              <Textarea rows={4} value={form.departmentsText} onChange={(event) => setForm({ ...form, departmentsText: event.target.value })} placeholder="Cardiology, Oncology" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Facilities</label>
              <Textarea rows={4} value={form.facilitiesText} onChange={(event) => setForm({ ...form, facilitiesText: event.target.value })} placeholder="Interpreter desk, ICU" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Image URLs</label>
              <Textarea rows={4} value={form.imagesText} onChange={(event) => setForm({ ...form, imagesText: event.target.value })} placeholder="One URL per line or comma separated" />
              <div className="mt-3">
                <ImageUploadField
                  onUploaded={(url) =>
                    setForm((current) => ({
                      ...current,
                      imagesText: current.imagesText ? `${current.imagesText}, ${url}` : url
                    }))
                  }
                  helperText="Upload hospital image"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Linked treatments</label>
            <div className="grid gap-2 md:grid-cols-3">
              {treatments.map((treatment) => (
                <label key={treatment.id} className="flex items-center gap-2 rounded-soft border border-border p-3 text-sm">
                  <input type="checkbox" checked={form.treatmentIds.includes(treatment.id)} onChange={() => toggleTreatment(treatment.id)} />
                  <span>{treatment.name}</span>
                </label>
              ))}
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
              {saving ? "Saving..." : form.id ? "Update hospital" : "Create hospital"}
            </Button>
            {form.id ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(form.id!)}>
                Delete hospital
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
