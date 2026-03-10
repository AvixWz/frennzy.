import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Card } from "@/components/ui/card";
import { buildJsonLd, buildMetadata } from "@/lib/seo";
import { getBlogBySlug, getBlogList } from "@/lib/services/public-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogList();
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return buildMetadata({ title: "Article Not Found | Mediway", path: `/blog/${slug}` });
  }

  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${slug}`,
    image: post.openGraphImage || post.featuredImage
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.authorName
    },
    datePublished: post.publishedAt,
    image: post.openGraphImage || post.featuredImage,
    articleSection: post.category,
    keywords: post.tags
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <Script id={`schema-blog-${post.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(schema) }} />
      <Card>
        <p className="text-xs uppercase tracking-wide text-secondary">{post.category}</p>
        <h1 className="mt-2 text-4xl font-semibold">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">{post.excerpt}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-muted">
          By {post.authorName} | {post.readTimeMinutes} min read
        </p>

        <article className="prose-medical mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {(post.tags as string[]).map((tag) => (
            <span key={tag} className="rounded-full bg-secondary/10 px-2 py-1 text-secondary">
              {tag}
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}

