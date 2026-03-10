import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency, parseJsonArray } from "@/lib/utils";
import { getTreatmentList } from "@/lib/services/public-service";

interface TreatmentsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    sort?: "name_asc" | "name_desc" | "cost_low_to_high" | "cost_high_to_low" | "recent";
  }>;
}

export const metadata = buildMetadata({
  title: "Treatments | Mediway",
  description:
    "Explore treatment options including heart surgery, IVF, orthopedic, cosmetic, dental implants, and organ transplant.",
  path: "/treatments"
});

const sortOptions = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "cost_low_to_high", label: "Cost (Low to High)" },
  { value: "cost_high_to_low", label: "Cost (High to Low)" },
  { value: "recent", label: "Most Recent" }
] as const;

export default async function TreatmentsPage({ searchParams }: TreatmentsPageProps) {
  const params = await searchParams;

  const treatments = await getTreatmentList({
    q: params.q,
    category: params.category,
    city: params.city,
    sort: params.sort
  });

  const categories = [...new Set(treatments.map((treatment) => treatment.category))];
  const cities = [...new Set(treatments.flatMap((treatment) => treatment.hospitalTreatments.map((entry) => entry.hospital.city)))];
  const hasFilters = Boolean(params.q || params.category || params.city || params.sort);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Treatments</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Compare procedures, recovery expectations, images, and treatment cost ranges across top hospitals in India.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">Popular categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category} href={`/treatments?category=${encodeURIComponent(category)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
                {category}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">Browse by city</p>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <Link key={city} href={`/treatments?city=${encodeURIComponent(city)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-card border border-border bg-card p-4 md:grid-cols-6">
        <Input name="q" defaultValue={params.q || ""} placeholder="Search treatments" className="md:col-span-2" />
        <Input name="category" defaultValue={params.category || ""} placeholder="Category" />
        <Input name="city" defaultValue={params.city || ""} placeholder="City" />
        <select
          name="sort"
          defaultValue={params.sort || "name_asc"}
          className="rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="w-full rounded-soft bg-primary px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
          {hasFilters ? (
            <Link href="/treatments" className="inline-flex items-center rounded-soft border border-border px-4 py-2 text-sm font-semibold">
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {treatments.length === 0 ? (
        <Card className="mt-8 text-center">
          <h2 className="text-xl font-semibold">No treatments found</h2>
          <p className="mt-2 text-sm text-muted">Try broadening your filters or search keywords.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment) => (
            <Card key={treatment.id} className="overflow-hidden p-0">
              <div className="relative h-52">
                <ProfileImage src={parseJsonArray(treatment.images)[0]} alt={treatment.name} fill />
              </div>
              <div className="p-6">
                <Badge>{treatment.category}</Badge>
                <h2 className="mt-3 text-xl font-semibold">{treatment.name}</h2>
                <p className="mt-2 text-sm text-muted">{treatment.procedure}</p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {formatCurrency(treatment.costMin, treatment.currency)} - {formatCurrency(treatment.costMax, treatment.currency)}
                </p>
                <p className="mt-2 text-sm text-muted">Recovery: {treatment.recovery}</p>
                <p className="mt-2 text-sm text-muted">
                  Cities: {[...new Set(treatment.hospitalTreatments.map((entry) => entry.hospital.city))].join(", ")}
                </p>
                <Link href={`/treatments/${treatment.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
                  View treatment page
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
