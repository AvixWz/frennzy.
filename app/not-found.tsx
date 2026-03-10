import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="mt-6 inline-flex rounded-soft bg-primary px-4 py-2 text-sm font-semibold text-white">
        Back to home
      </Link>
    </section>
  );
}
