import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/lib/seo";
import { getBlogList } from "@/lib/services/public-service";

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    sort?: "latest" | "oldest" | "title_asc";
  }>;
}

export const metadata = buildMetadata({
  title: "Medical Tourism Blog | Mediway",
  description: "Educational resources, treatment guides, and travel tips for international patients.",
  path: "/blog"
});

const sortOptions = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title (A-Z)" }
] as const;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const posts = await getBlogList({
    q: params.q,
    category: params.category,
    tag: params.tag,
    sort: params.sort
  });
  const hasFilters = Boolean(params.q || params.category || params.tag || params.sort);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Medical Tourism Blog</h1>
      <p className="mt-3 text-muted">SEO-focused patient guides, hospital insights, and practical treatment planning tips.</p>

      <form className="mt-6 grid gap-3 rounded-card border border-border bg-card p-4 md:grid-cols-5">
        <Input name="q" placeholder="Search topics" defaultValue={params.q || ""} className="md:col-span-2" />
        <Input name="category" placeholder="Category" defaultValue={params.category || ""} />
        <Input name="tag" placeholder="Tag" defaultValue={params.tag || ""} />
        <select
          name="sort"
          defaultValue={params.sort || "latest"}
          className="rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="w-full rounded-soft bg-primary px-4 py-2 text-sm font-semibold text-white">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link
              href="/blog"
              className="inline-flex items-center rounded-soft border border-border px-4 py-2 text-sm font-semibold"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {posts.length === 0 ? (
        <Card className="mt-8 text-center">
          <h2 className="text-xl font-semibold">No articles found</h2>
          <p className="mt-2 text-sm text-muted">Try fewer filters or a different keyword.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <p className="text-xs uppercase tracking-wide text-secondary">{post.category}</p>
              <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted">By {post.authorName}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
                Read article
              </Link>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
