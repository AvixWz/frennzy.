"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

interface InquiryFormProps {
  treatmentPreset?: string;
  compact?: boolean;
}

type FormState = {
  name: string;
  country: string;
  phone: string;
  email: string;
  treatmentInterest: string;
  message: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialFormState = (treatmentPreset: string): FormState => ({
  name: "",
  country: "",
  phone: "",
  email: "",
  treatmentInterest: treatmentPreset,
  message: "",
  website: ""
});

export function InquiryForm({ treatmentPreset = "", compact = false }: InquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<FormState>(() => initialFormState(treatmentPreset));

  useEffect(() => {
    setForm((prev) => ({ ...prev, treatmentInterest: treatmentPreset }));
  }, [treatmentPreset]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setErrors({});

    const payload = {
      ...form,
      message:
        form.message.trim() ||
        `Interested in ${form.treatmentInterest || "medical consultation"}. Please contact me with next steps.`
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSeconds?: number;
        fieldErrors?: Record<string, string[]>;
      };

      if (!response.ok) {
        if (result.fieldErrors) {
          const mappedErrors: FieldErrors = {};
          for (const [key, values] of Object.entries(result.fieldErrors)) {
            const first = values?.[0];
            if (!first) continue;
            if (key in form) {
              mappedErrors[key as keyof FormState] = first;
            }
          }
          setErrors(mappedErrors);
        }

        const retryText =
          response.status === 429 && result.retryAfterSeconds
            ? ` Please retry in about ${result.retryAfterSeconds} seconds.`
            : "";

        setStatus({
          type: "error",
          message: `${result.error || "Unable to submit right now."}${retryText}`
        });
        return;
      }

      setStatus({
        type: "success",
        message: "Thanks, your inquiry has been submitted. Our care team will contact you soon."
      });
      setForm(initialFormState(treatmentPreset));
    } catch {
      setStatus({
        type: "error",
        message: "Unable to submit right now. Please try again in a moment."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input
            required
            minLength={2}
            placeholder="Patient name"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          {errors.name ? <p className="mt-1 text-xs text-danger">{errors.name}</p> : null}
        </div>
        <div>
          <Input
            required
            minLength={2}
            placeholder="Country"
            value={form.country}
            onChange={(event) => setField("country", event.target.value)}
          />
          {errors.country ? <p className="mt-1 text-xs text-danger">{errors.country}</p> : null}
        </div>
        <div>
          <Input
            required
            minLength={5}
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
          />
          {errors.phone ? <p className="mt-1 text-xs text-danger">{errors.phone}</p> : null}
        </div>
        <div>
          <Input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
          />
          {errors.email ? <p className="mt-1 text-xs text-danger">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <Input
          required
          minLength={2}
          placeholder="Treatment interest"
          value={form.treatmentInterest}
          onChange={(event) => setField("treatmentInterest", event.target.value)}
        />
        {errors.treatmentInterest ? <p className="mt-1 text-xs text-danger">{errors.treatmentInterest}</p> : null}
      </div>

      {!compact ? (
        <div>
          <Textarea
            rows={5}
            placeholder="Tell us your medical history and treatment goals"
            value={form.message}
            onChange={(event) => setField("message", event.target.value)}
          />
          {errors.message ? <p className="mt-1 text-xs text-danger">{errors.message}</p> : null}
        </div>
      ) : null}

      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        value={form.website}
        onChange={(event) => setField("website", event.target.value)}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? "Submitting..." : "Request Free Consultation"}
      </Button>

      {status ? (
        <p className={`text-sm ${status.type === "error" ? "text-danger" : "text-success"}`}>{status.message}</p>
      ) : null}
    </form>
  );
}
