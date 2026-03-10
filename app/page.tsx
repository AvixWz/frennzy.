import Link from "next/link";
import Script from "next/script";
import { ArrowRight, Building2, Globe2, HeartPulse, MessageSquareQuote, ShieldCheck, Stethoscope } from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { DoctorCard } from "@/components/public/doctor-card";
import { HospitalCard } from "@/components/public/hospital-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buildJsonLd, buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";
import { getHomepageData } from "@/lib/services/public-service";

export const metadata = buildMetadata({
  title: "Mediway | Medical Tourism Platform for International Patients",
  description:
    "Find top hospitals, experienced doctors, transparent treatment costs, and full travel support for your medical journey in India.",
  path: "/"
});

export default async function HomePage() {
  const data = await getHomepageData();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Mediway",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    areaServed: "International",
    serviceType: "Medical Tourism",
    availableService: [
      "Treatment planning",
      "Hospital matching",
      "Doctor consultations",
      "Visa and travel support"
    ]
  };

  return (
    <>
      <Script id="schema-home" type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(organizationSchema) }} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="space-y-6">
          <Badge>Trusted by international patients across 30+ countries</Badge>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Advanced healthcare in India with complete medical tourism support.
          </h1>
          <p className="max-w-xl text-base text-muted sm:text-lg">
            Compare treatments, connect with experienced specialists, and get end-to-end coordination from inquiry to recovery.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-soft bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              Get Free Consultation
            </Link>
            <Link href="/treatments" className="rounded-soft border border-border px-5 py-3 text-sm font-semibold transition hover:bg-card">
              Explore Treatments
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: "Hospitals", value: data.hospitals.length },
              { label: "Doctors", value: data.doctors.length },
              { label: "Treatments", value: data.treatments.length }
            ].map((item) => (
              <Card key={item.label} className="p-4 text-center">
                <div className="text-2xl font-semibold text-primary">{item.value}+</div>
                <p className="text-xs uppercase tracking-wide text-muted">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-0">
          <InquiryForm compact />
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Top Treatment Categories</h2>
          <Link href="/treatments" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.treatments.map((treatment) => (
            <Card key={treatment.id}>
              <p className="text-xs uppercase tracking-wide text-secondary">{treatment.category}</p>
              <h3 className="mt-2 text-xl font-semibold">{treatment.name}</h3>
              <p className="mt-2 text-sm text-muted">{treatment.procedure.slice(0, 130)}...</p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {formatCurrency(treatment.costMin, treatment.currency)} - {formatCurrency(treatment.costMax, treatment.currency)}
              </p>
              <Link href={`/treatments/${treatment.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
                View details
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Featured Doctors</h2>
          <Link href="/doctors" className="text-sm font-semibold text-primary">
            Browse directory
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-semibold">Featured Hospitals</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.hospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-semibold">International Patient Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Globe2, title: "Visa Assistance", body: "Hospital invitation letters and application guidance." },
            { icon: HeartPulse, title: "Treatment Planning", body: "Cost estimates, timelines and specialist matching." },
            { icon: Building2, title: "Hospital Coordination", body: "Priority appointments and admission support." },
            { icon: ShieldCheck, title: "Post-Care Follow Up", body: "Recovery tracking and remote follow-up." }
          ].map((item) => (
            <Card key={item.title}>
              <item.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-semibold">Patient Testimonials</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <MessageSquareQuote className="h-6 w-6 text-secondary" />
              <p className="mt-3 text-sm text-muted">"{testimonial.comment}"</p>
              <p className="mt-3 text-sm font-semibold">{testimonial.patientName}</p>
              <p className="text-xs uppercase tracking-wide text-muted">
                {testimonial.country} | {testimonial.treatment}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Medical Tourism Insights</h2>
          <Link href="/blog" className="text-sm font-semibold text-primary">
            Visit blog
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.blogs.map((post) => (
            <Card key={post.id}>
              <p className="text-xs uppercase tracking-wide text-secondary">{post.category}</p>
              <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
                Read article
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="grid gap-8 lg:grid-cols-2">
          <div>
            <Badge>Free Consultation</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Share your case and get a treatment plan in 24-48 hours.</h2>
            <p className="mt-3 text-sm text-muted">
              Our coordinators review your records with specialist teams and provide transparent recommendations.
            </p>
            <div className="mt-6 space-y-3 text-sm text-muted">
              <p className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> Specialist opinion</p>
              <p className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" /> End-to-end travel support</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure and confidential</p>
            </div>
          </div>
          <InquiryForm />
        </Card>
      </section>
    </>
  );
}
