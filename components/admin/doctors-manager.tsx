"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { parseDelimitedList, safeParseJson, stringifyDelimitedList } from "@/lib/utils";

type ReferenceItem = {
  id: string;
  name: string;
};

type DoctorRecord = {
  id: string;
  name: string;
  slug: string;
  specialization: string;
  experienceYears: number;
  city: string;
  imageUrl: string;
  googleReviewUrl?: string | null;
  websiteUrl?: string | null;
  hospitalId: string;
  languages: string[];
  education: string;
  certifications: string[];
  biography: string;
  patientReviews: Array<{ title: string; rating: number; text: string }>;
  consultationFee: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  hospital: ReferenceItem;
  doctorTreatments: Array<{ treatment: ReferenceItem }>;
};

type DoctorFormState = {
  id?: string;
  name: string;
  specialization: string;
  experienceYears: string;
  city: string;
  imageUrl: string;
  googleReviewUrl: string;
  websiteUrl: string;
  hospitalId: string;
  languagesText: string;
  education: string;
  certificationsText: string;
  biography: string;
  patientReviewsText: string;
  consultationFee: string;
  treatmentIds: string[];
  seoTitle: string;
  seoDescription: string;
};

const emptyReviewsJson = JSON.stringify([{ title: "Excellent care", rating: 5, text: "Supportive treatment journey." }], null, 2);

const createEmptyState = (): DoctorFormState => ({
  name: "",
  specialization: "",
  experienceYears: "",
  city: "",
  imageUrl: "",
  googleReviewUrl: "",
  websiteUrl: "",
  hospitalId: "",
  languagesText: "",
  education: "",
  certificationsText: "",
  biography: "",
  patientReviewsText: emptyReviewsJson,
  consultationFee: "",
  treatmentIds: [],
  seoTitle: "",
  seoDescription: ""
});

function toFormState(item: DoctorRecord): DoctorFormState {
  return {
    id: item.id,
    name: item.name,
    specialization: item.specialization,
    experienceYears: String(item.experienceYears),
    city: item.city,
    imageUrl: item.imageUrl,
    googleReviewUrl: item.googleReviewUrl || "",
    websiteUrl: item.websiteUrl || "",
    hospitalId: item.hospitalId,
    languagesText: stringifyDelimitedList(item.languages),
    education: item.education,
    certificationsText: stringifyDelimitedList(item.certifications),
    biography: item.biography,
    patientReviewsText: JSON.stringify(item.patientReviews, null, 2),
    consultationFee: item.consultationFee ? String(item.consultationFee) : "",
    treatmentIds: item.doctorTreatments.map((entry) => entry.treatment.id),
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || ""
  };
}

interface DoctorsManagerProps {
  initialDoctors: DoctorRecord[];
  hospitals: ReferenceItem[];
  treatments: ReferenceItem[];
}

export function DoctorsManager({ initialDoctors, hospitals, treatments }: DoctorsManagerProps) {
  const [items, setItems] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<DoctorFormState>(() => ({
    ...createEmptyState(),
    hospitalId: hospitals[0]?.id || ""
  }));
  const [saving, setSaving] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.name, item.specialization, item.city, item.hospital.name].some((value) =>
      value.toLowerCase().includes(search.toLowerCase())
    )
  );

  function resetForm() {
    setForm({
      ...createEmptyState(),
      hospitalId: hospitals[0]?.id || ""
    });
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
      specialization: form.specialization,
      experienceYears: Number(form.experienceYears || 0),
      city: form.city,
      imageUrl: form.imageUrl,
      googleReviewUrl: form.googleReviewUrl || undefined,
      websiteUrl: form.websiteUrl || undefined,
      hospitalId: form.hospitalId,
      languages: parseDelimitedList(form.languagesText),
      education: form.education,
      certifications: parseDelimitedList(form.certificationsText),
      biography: form.biography,
      patientReviews: safeParseJson(form.patientReviewsText, [] as Array<{ title: string; rating: number; text: string }>),
      consultationFee: form.consultationFee ? Number(form.consultationFee) : null,
      treatmentIds: form.treatmentIds,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined
    };

    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const saved = (await response.json()) as DoctorRecord;
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
    const confirmed = window.confirm("Delete this doctor?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Doctors</h2>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>
        <Input placeholder="Search doctors" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setForm(toFormState(item))}
              className="w-full rounded-soft border border-border bg-bg p-4 text-left transition hover:border-primary/40"
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted">{item.specialization}</p>
              <p className="text-sm text-muted">
                {item.hospital.name} • {item.city}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Doctor name</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Specialization</label>
              <Input value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Experience (years)</label>
              <Input type="number" min={0} value={form.experienceYears} onChange={(event) => setForm({ ...form, experienceYears: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hospital</label>
              <select
                value={form.hospitalId}
                onChange={(event) => setForm({ ...form, hospitalId: event.target.value })}
                className="w-full rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
              >
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Consultation fee</label>
              <Input value={form.consultationFee} onChange={(event) => setForm({ ...form, consultationFee: event.target.value })} placeholder="120" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Image URL</label>
              <Input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} required />
              <div className="mt-3">
                <ImageUploadField onUploaded={(url) => setForm((current) => ({ ...current, imageUrl: url }))} helperText="Upload doctor image" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Google review URL</label>
              <Input value={form.googleReviewUrl} onChange={(event) => setForm({ ...form, googleReviewUrl: event.target.value })} placeholder="https://www.google.com/search?..." />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Website URL</label>
              <Input value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} placeholder="https://doctor.example.com" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Biography</label>
            <Textarea rows={5} value={form.biography} onChange={(event) => setForm({ ...form, biography: event.target.value })} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Languages</label>
              <Textarea rows={3} value={form.languagesText} onChange={(event) => setForm({ ...form, languagesText: event.target.value })} placeholder="English, Hindi, Arabic" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Certifications</label>
              <Textarea rows={3} value={form.certificationsText} onChange={(event) => setForm({ ...form, certificationsText: event.target.value })} placeholder="FRCS, Fellowship" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Education</label>
              <Textarea rows={3} value={form.education} onChange={(event) => setForm({ ...form, education: event.target.value })} />
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

          <div>
            <label className="mb-2 block text-sm font-medium">Patient reviews JSON</label>
            <Textarea rows={8} value={form.patientReviewsText} onChange={(event) => setForm({ ...form, patientReviewsText: event.target.value })} />
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
              {saving ? "Saving..." : form.id ? "Update doctor" : "Create doctor"}
            </Button>
            {form.id ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(form.id!)}>
                Delete doctor
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
