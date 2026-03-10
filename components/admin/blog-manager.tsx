"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { parseDelimitedList } from "@/lib/utils";

type BlogRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  authorName: string;
  authorTitle: string;
  published: boolean;
  publishedAt: string | null;
  schemaType: string;
  readTimeMinutes: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  openGraphImage?: string | null;
};

type BlogFormState = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tagsText: string;
  authorName: string;
  authorTitle: string;
  published: boolean;
  publishedAt: string;
  schemaType: string;
  readTimeMinutes: string;
  seoTitle: string;
  seoDescription: string;
  openGraphImage: string;
};

const createEmptyState = (): BlogFormState => ({
  title: "",
  excerpt: "",
  content: "<h2>Introduction</h2><p>Start the article here.</p>",
  featuredImage: "",
  category: "",
  tagsText: "",
  authorName: "",
  authorTitle: "",
  published: true,
  publishedAt: new Date().toISOString().slice(0, 16),
  schemaType: "Article",
  readTimeMinutes: "6",
  seoTitle: "",
  seoDescription: "",
  openGraphImage: ""
});

function toFormState(item: BlogRecord): BlogFormState {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    featuredImage: item.featuredImage,
    category: item.category,
    tagsText: item.tags.join(", "),
    authorName: item.authorName,
    authorTitle: item.authorTitle,
    published: item.published,
    publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : "",
    schemaType: item.schemaType,
    readTimeMinutes: String(item.readTimeMinutes),
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || "",
    openGraphImage: item.openGraphImage || ""
  };
}

interface BlogManagerProps {
  initialPosts: BlogRecord[];
}

export function BlogManager({ initialPosts }: BlogManagerProps) {
  const [items, setItems] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<BlogFormState>(createEmptyState());
  const [saving, setSaving] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.title, item.category, item.authorName].some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  function resetForm() {
    setForm(createEmptyState());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      id: form.id,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      featuredImage: form.featuredImage,
      category: form.category,
      tags: parseDelimitedList(form.tagsText),
      authorName: form.authorName,
      authorTitle: form.authorTitle,
      published: form.published,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      schemaType: form.schemaType,
      readTimeMinutes: Number(form.readTimeMinutes || 6),
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      openGraphImage: form.openGraphImage || undefined
    };

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) return;
      const saved = (await response.json()) as BlogRecord;
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
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold">Blog posts</h2>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>
        <Input placeholder="Search posts" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setForm(toFormState(item))}
              className="w-full rounded-soft border border-border bg-bg p-4 text-left transition hover:border-primary/40"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted">{item.category}</p>
              <p className="text-xs text-muted">{item.published ? "Published" : "Draft"}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Author name</label>
              <Input value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Author title</label>
              <Input value={form.authorTitle} onChange={(event) => setForm({ ...form, authorTitle: event.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Excerpt</label>
              <Textarea rows={3} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Featured image URL</label>
              <Input value={form.featuredImage} onChange={(event) => setForm({ ...form, featuredImage: event.target.value })} required />
              <div className="mt-3">
                <ImageUploadField onUploaded={(url) => setForm((current) => ({ ...current, featuredImage: url }))} helperText="Upload featured image" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Article content</label>
            <RichTextEditor value={form.content} onChange={(value) => setForm({ ...form, content: value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tags</label>
              <Input value={form.tagsText} onChange={(event) => setForm({ ...form, tagsText: event.target.value })} placeholder="medical tourism, india healthcare" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Schema type</label>
              <Input value={form.schemaType} onChange={(event) => setForm({ ...form, schemaType: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Read time (minutes)</label>
              <Input type="number" min={1} value={form.readTimeMinutes} onChange={(event) => setForm({ ...form, readTimeMinutes: event.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Published at</label>
              <Input type="datetime-local" value={form.publishedAt} onChange={(event) => setForm({ ...form, publishedAt: event.target.value })} />
            </div>
            <label className="flex items-center gap-3 rounded-soft border border-border p-3 text-sm font-medium">
              <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
              Published
            </label>
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
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Open graph image URL</label>
              <Input value={form.openGraphImage} onChange={(event) => setForm({ ...form, openGraphImage: event.target.value })} />
              <div className="mt-3">
                <ImageUploadField onUploaded={(url) => setForm((current) => ({ ...current, openGraphImage: url }))} helperText="Upload OG image" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update post" : "Create post"}
            </Button>
            {form.id ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(form.id!)}>
                Delete post
              </Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
