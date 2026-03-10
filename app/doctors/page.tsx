import Link from "next/link";
import { DoctorCard } from "@/components/public/doctor-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/lib/seo";
import { getDoctorList, getHospitalList } from "@/lib/services/public-service";

interface DoctorsPageProps {
  searchParams: Promise<{
    q?: string;
    specialization?: string;
    hospitalId?: string;
    city?: string;
    minExperience?: string;
    sort?: "experience_desc" | "experience_asc" | "name_asc" | "name_desc";
  }>;
}

export const metadata = buildMetadata({
  title: "Doctors Directory | Mediway",
  description:
    "Search and filter doctors by specialization, hospital, city, and years of experience.",
  path: "/doctors"
});

const sortOptions = [
  { value: "experience_desc", label: "Most Experienced" },
  { value: "experience_asc", label: "Least Experienced" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" }
] as const;

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams;

  const doctors = await getDoctorList({
    q: params.q,
    specialization: params.specialization,
    hospitalId: params.hospitalId,
    city: params.city,
    minExperience: params.minExperience ? Number(params.minExperience) : undefined,
    sort: params.sort
  });

  const hospitals = await getHospitalList();
  const cities = [...new Set(doctors.map((doctor) => doctor.city))];
  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization))];
  const hasFilters = Boolean(params.q || params.specialization || params.hospitalId || params.city || params.minExperience || params.sort);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Doctors Directory</h1>
      <p className="mt-3 text-muted">Filter specialists by expertise, city, and hospital affiliation.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link key={city} href={`/doctors?city=${encodeURIComponent(city)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
            {city}
          </Link>
        ))}
        {specializations.slice(0, 6).map((specialization) => (
          <Link key={specialization} href={`/doctors?specialization=${encodeURIComponent(specialization)}`} className="rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-semibold text-muted transition hover:text-primary">
            {specialization}
          </Link>
        ))}
      </div>

      <form className="mt-6 grid gap-3 rounded-card border border-border bg-card p-4 md:grid-cols-6">
        <Input name="q" defaultValue={params.q || ""} placeholder="Search doctor or hospital" className="md:col-span-2" />
        <Input name="specialization" defaultValue={params.specialization || ""} placeholder="Specialization" />
        <select
          name="hospitalId"
          defaultValue={params.hospitalId || ""}
          className="rounded-soft border border-border bg-white/70 px-3 py-2 text-sm"
        >
          <option value="">All hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
        <Input name="city" defaultValue={params.city || ""} placeholder="City" />
        <Input name="minExperience" type="number" min={0} defaultValue={params.minExperience || ""} placeholder="Min years" />
        <select
          name="sort"
          defaultValue={params.sort || "experience_desc"}
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
              href="/doctors"
              className="inline-flex items-center rounded-soft border border-border px-4 py-2 text-sm font-semibold"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      {doctors.length === 0 ? (
        <Card className="mt-8 text-center">
          <h2 className="text-xl font-semibold">No doctors found</h2>
          <p className="mt-2 text-sm text-muted">Try broadening your filters or changing search terms.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </section>
  );
}
