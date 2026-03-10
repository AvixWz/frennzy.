import Link from "next/link";
import { Card } from "@/components/ui/card";
import { HospitalCard } from "@/components/public/hospital-card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/lib/seo";
import { getHospitalList } from "@/lib/services/public-service";
import { parseJsonArray } from "@/lib/utils";

interface HospitalsPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    specialty?: string;
    sort?: "name_asc" | "name_desc" | "doctors_desc" | "recent";
  }>;
}

export const metadata = buildMetadata({
  title: "Hospitals Directory | Mediway",
  description: "Browse partner hospitals by city and specialty for international medical tourism.",
  path: "/hospitals"
});

const sortOptions = [
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "doctors_desc", label: "Most Doctors" },
  { value: "recent", label: "Recently Updated" }
] as const;

export default async function HospitalsPage({ searchParams }: HospitalsPageProps) {
  const params = await searchParams;
  const hospitals = await getHospitalList({
    q: params.q,
    city: params.city,
    specialty: params.specialty,
    sort: params.sort
  });
  const cities = [...new Set(hospitals.map((hospital) => hospital.city))];
  const specialties = [...new Set(hospitals.flatMap((hospital) => parseJsonArray(hospital.departments)))];
  const hasFilters = Boolean(params.q || params.city || params.specialty || params.sort);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Hospitals Directory</h1>
      <p className="mt-3 text-muted">Find accredited hospitals by city and clinical specialties.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link key={city} href={`/hospitals?city=${encodeURIComponent(city)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
            {city}
          </Link>
        ))}
        {specialties.slice(0, 8).map((specialty) => (
          <Link key={specialty} href={`/hospitals?specialty=${encodeURIComponent(specialty)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
            {specialty}
          </Link>
        ))}
      </div>

      <form className="mt-6 grid gap-3 rounded-card border border-border bg-card p-4 md:grid-cols-5">
        <Input name="q" placeholder="Search hospital, city, specialty" defaultValue={params.q || ""} className="md:col-span-2" />
        <Input name="city" placeholder="City" defaultValue={params.city || ""} />
        <Input name="specialty" placeholder="Specialty" defaultValue={params.specialty || ""} />
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
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="w-full rounded-soft bg-primary px-4 py-2 text-sm font-semibold text-white">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link
              href="/hospitals"
              className="inline-flex items-center rounded-soft border border-border px-4 py-2 text-sm font-semibold"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {hospitals.length === 0 ? (
        <Card className="mt-8 text-center">
          <h2 className="text-xl font-semibold">No hospitals found</h2>
          <p className="mt-2 text-sm text-muted">Try broader keywords, city, or specialty filters.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      )}
    </section>
  );
}
