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
import { getDoctorBySlug, getDoctorList } from "@/lib/services/public-service";
import { buildGoogleSearchLink, formatRating, getAverageRating, parseJsonArray } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const doctors = await getDoctorList();
  return doctors.map((doctor: { slug: string }) => ({ slug: doctor.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return buildMetadata({ title: "Doctor Not Found | Mediway", path: `/doctors/${slug}` });
  }

  return buildMetadata({
    title: doctor.seoTitle || `${doctor.name} | ${doctor.specialization}`,
    description: doctor.seoDescription || doctor.biography,
    path: `/doctors/${slug}`
  });
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const reviews = (doctor.patientReviews as Array<{ title: string; text: string; rating: number }>) || [];
  const rating = getAverageRating(reviews);
  const googleLink = doctor.googleReviewUrl || buildGoogleSearchLink(doctor.name, doctor.city);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: doctor.specialization,
    worksFor: {
      "@type": "Hospital",
      name: doctor.hospital.name
    },
    url: doctor.websiteUrl || undefined,
    alumniOf: doctor.education,
    knowsLanguage: doctor.languages,
    address: {
      "@type": "PostalAddress",
      addressLocality: doctor.city,
      addressCountry: "India"
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Script id={`schema-doctor-${doctor.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(schema) }} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="overflow-hidden p-0">
          <div className="grid lg:grid-cols-[320px,1fr]">
            <div className="relative min-h-[320px]">
              <ProfileImage src={doctor.imageUrl} alt={doctor.name} fill />
            </div>
            <div className="p-6">
              <Badge>{doctor.specialization}</Badge>
              <h1 className="mt-4 text-4xl font-semibold">{doctor.name}</h1>
              <p className="mt-2 text-muted">
                {doctor.hospital.name} | {doctor.city} | {doctor.experienceYears} years experience
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  {formatRating(rating)}
                </span>
                <span>Consultation {doctor.consultationFee ? `$${doctor.consultationFee}` : "On request"}</span>
                <span>{parseJsonArray(doctor.languages).join(", ")}</span>
              </div>
              <p className="mt-5 text-sm text-muted">{doctor.biography}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {doctor.websiteUrl ? (
                  <a
                    href={doctor.websiteUrl}
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
                  Google profile <ExternalLink className="h-4 w-4" />
                </a>
                <Link href={`/hospitals/${doctor.hospital.slug}`} className="text-sm font-semibold text-muted hover:text-primary">
                  View hospital
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <InquiryForm treatmentPreset={doctor.specialization} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-2xl font-semibold">Education</h2>
          <p className="mt-3 text-sm text-muted">{doctor.education}</p>

          <h2 className="mt-8 text-2xl font-semibold">Certifications</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {parseJsonArray(doctor.certifications).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl font-semibold">Patient Reviews</h2>
          <div className="mt-3 space-y-3">
            {reviews.map((review, index) => (
              <Card key={`${review.title}-${index}`} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold">{review.title}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                    <Star className="h-4 w-4 text-amber-500" />
                    {review.rating}/5
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{review.text}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Doctor snapshot</h2>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>Languages: {parseJsonArray(doctor.languages).join(", ")}</p>
            <p>Hospital: {doctor.hospital.name}</p>
            <p>Experience: {doctor.experienceYears} years</p>
            <p>City: {doctor.city}</p>
            <p>Specialization: {doctor.specialization}</p>
            <p>Website: {doctor.websiteUrl ? "Available" : "Not listed"}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
