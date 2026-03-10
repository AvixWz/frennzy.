import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildJsonLd, buildMetadata } from "@/lib/seo";
import { formatCurrency, parseJsonArray } from "@/lib/utils";
import { getTreatmentBySlug, getTreatmentList } from "@/lib/services/public-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getTreatmentList();
  return items.map((item: { slug: string }) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug);

  if (!treatment) {
    return buildMetadata({ title: "Treatment Not Found | Mediway", path: `/treatments/${slug}` });
  }

  return buildMetadata({
    title: treatment.seoTitle || `${treatment.name} in India | Mediway`,
    description: treatment.seoDescription || treatment.procedure,
    path: `/treatments/${slug}`
  });
}

export default async function TreatmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug);

  if (!treatment) {
    notFound();
  }

  const faqs = (treatment.faqs as Array<{ question: string; answer: string }>) || [];
  const images = parseJsonArray(treatment.images);
  const cityList = [...new Set(treatment.hospitalTreatments.map((relation) => relation.hospital.city))];

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatment.name,
    description: treatment.procedure,
    procedureType: treatment.category,
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: treatment.currency,
      minValue: treatment.costMin,
      maxValue: treatment.costMax
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <Script id={`schema-treatment-${treatment.slug}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(schema) }} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative h-[340px]">
            <ProfileImage src={images[0]} alt={treatment.name} fill />
          </div>
          <div className="p-6">
            <Badge>{treatment.category}</Badge>
            <h1 className="mt-4 text-4xl font-semibold">{treatment.name}</h1>
            <p className="mt-3 max-w-3xl text-muted">{treatment.procedure}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                {formatCurrency(treatment.costMin, treatment.currency)} - {formatCurrency(treatment.costMax, treatment.currency)}
              </span>
              <span>Recovery: {treatment.recovery}</span>
              <span>Cities: {cityList.join(", ")}</span>
            </div>
          </div>
        </Card>

        <InquiryForm treatmentPreset={treatment.name} />
      </div>

      {images.length > 1 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {images.slice(1).map((image, index) => (
            <div key={`${image}-${index}`} className="relative h-48 overflow-hidden rounded-card border border-border">
              <ProfileImage src={image} alt={`${treatment.name} image ${index + 2}`} fill />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-2xl font-semibold">Procedure Overview</h2>
          <p className="mt-3 text-sm text-muted">{treatment.procedure}</p>

          <h2 className="mt-8 text-2xl font-semibold">Recovery Details</h2>
          <p className="mt-3 text-sm text-muted">{treatment.recovery}</p>

          <h2 className="mt-8 text-2xl font-semibold">Recommended Hospitals</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {treatment.hospitalTreatments.map((relation) => (
              <Link key={relation.hospital.id} href={`/hospitals/${relation.hospital.slug}`} className="rounded-soft border border-border bg-bg p-4 transition hover:border-primary/40">
                <p className="font-semibold">{relation.hospital.name}</p>
                <p className="text-sm text-muted">{relation.hospital.city}</p>
              </Link>
            ))}
          </div>

          <h2 className="mt-8 text-2xl font-semibold">Recommended Doctors</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {treatment.doctorTreatments.map((relation) => (
              <Link key={relation.doctor.id} href={`/doctors/${relation.doctor.slug}`} className="rounded-soft border border-border bg-bg p-4 transition hover:border-primary/40">
                <p className="font-semibold">{relation.doctor.name}</p>
                <p className="text-sm text-muted">{relation.doctor.specialization}</p>
              </Link>
            ))}
          </div>

          <h2 className="mt-8 text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="mt-3 space-y-3">
            {faqs.map((faq, index) => (
              <Card key={`${faq.question}-${index}`} className="p-4">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-1 text-sm text-muted">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Treatment snapshot</h2>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <p>Category: {treatment.category}</p>
            <p>Available cities: {cityList.join(", ")}</p>
            <p>Hospitals: {treatment.hospitalTreatments.length}</p>
            <p>Doctors: {treatment.doctorTreatments.length}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
