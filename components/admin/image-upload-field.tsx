"use client";

import type { ChangeEvent } from "react";
import { useId, useState } from "react";
import { Upload } from "lucide-react";

interface ImageUploadFieldProps {
  onUploaded: (url: string) => void;
  helperText?: string;
}

export function ImageUploadField({ onUploaded, helperText = "Upload image" }: ImageUploadFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        setMessage(result?.error || "Upload failed");
        return;
      }

      const result = (await response.json()) as { url: string };
      onUploaded(result.url);
      setMessage("Upload complete");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input id={inputId} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleChange} />
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-soft border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-white"
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading..." : helperText}
      </label>
      {message ? <span className="text-xs font-semibold text-muted">{message}</span> : null}
    </div>
  );
}
