import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ExternalLink, Globe, Star } from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildJsonLd, buildMetadata } from "@/lib/seo";
import { getHospitalBySlug, getHospitalList } from "@/lib/services/public-service";
import { buildGoogleSearchLink, formatRating, parseJsonArray } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const hospitals = await getHospitalList();
  return hospitals.map((hospital: { slug: string }) => ({ slug: hospital.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hospital = await getHospitalBySlug(slug);

  if (!hospital) {
    return buildMetadata({ title: "Hospital Not Found | Mediway", path: `/hospitals/${slug}` });
  }

  return buildMetadata({
    title: hospital.seoTitle || `${hospital.name} | Mediway`,
    description: hospital.seoDescription || hospital.overview,
    path: `/hospitals/${slug}`
  });
}

export default async function HospitalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const hospital = await getHospitalBySlug(slug);

  if (!hospital) {
    notFound();
  }

  const images = parseJsonArray(hospital.images);
  const accreditations = parseJsonArray(hospital.accreditations);
  const departments = parseJsonArray(hospital.departments);
  const facilities = parseJsonArray(hospital.facilities);
  const googleRating = 4.6 + Math.min(0.3, hospital.doctors.length * 0.03);
  const googleLink = hospital.googleReviewUrl || buildGoogleSearchLink(hospital.name, hospital.city);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: hospital.name,
    description: hospital.overview,
    address: {
      "@type": "PostalAddress",
      addressLocality: hospital.city,
      addressCountry: hospital.country
    },
    url: hospital.websiteUrl || undefined,
    medicalSpecialty: hospital.departments,
    telephone: hospital.contactPhone,
    email: hospital.contactEmail
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Script id={`schema-hospital-${hospital.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(schema) }} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative h-[340px]">
            <ProfileImage src={images[0]} alt={hospital.name} fill />
          </div>
          <div className="p-6">
            <Badge>{hospital.city}</Badge>
            <h1 className="mt-4 text-4xl font-semibold">{hospital.name}</h1>
            <p className="mt-3 max-w-3xl text-muted">{hospital.overview}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                {formatRating(googleRating)}
              </span>
              <span>{hospital.doctors.length} specialist profiles</span>
              <span>{accreditations.join(", ")}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {hospital.websiteUrl ? (
                <a
                  href={hospital.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary"
                >
                  Official website <Globe className="h-4 w-4" />
                </a>
              ) : null}
              <a
                href={googleLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
              >
                Google listing <ExternalLink className="h-4 w-4" />
              </a>
              <a href={`mailto:${hospital.contactEmail}`} className="text-sm font-semibold text-muted hover:text-primary">
                {hospital.contactEmail}
              </a>
            </div>
          </div>
        </Card>

        <InquiryForm treatmentPreset={departments[0] || "Medical Consultation"} />
      </div>

      {images.length > 1 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {images.slice(1).map((image, index) => (
            <div key={`${image}-${index}`} className="relative h-48 overflow-hidden rounded-card border border-border">
              <ProfileImage src={image} alt={`${hospital.name} image ${index + 2}`} fill />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-2xl font-semibold">Accreditations</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {accreditations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold">Departments</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {departments.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>

          <h2 className="mt-8 text-2xl font-semibold">Facilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {facilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold">Doctors Working Here</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {hospital.doctors.map((doctor: { id: string; slug: string; name: string; specialization: string; imageUrl: string }) => (
              <Link key={doctor.id} href={`/doctors/${doctor.slug}`} className="rounded-soft border border-border bg-bg p-4 transition hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <ProfileImage src={doctor.imageUrl} alt={doctor.name} fill />
                  </div>
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-muted">{doctor.specialization}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>Phone: {hospital.contactPhone}</p>
            <p>Email: {hospital.contactEmail}</p>
            <p>
              Website:{" "}
              {hospital.websiteUrl ? (
                <a href={hospital.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary">
                  Open site
                </a>
              ) : (
                "Not listed"
              )}
            </p>
            <p>City: {hospital.city}</p>
            <p>Country: {hospital.country}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
