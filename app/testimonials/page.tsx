import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildMetadata } from "@/lib/seo";
import { getTestimonials } from "@/lib/services/public-service";

export const metadata = buildMetadata({
  title: "Patient Testimonials | Mediway",
  description: "Read treatment experiences shared by international patients.",
  path: "/testimonials"
});

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold">Patient Testimonials</h1>
      <p className="mt-3 text-muted">Stories from international patients who completed treatment journeys in India.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="overflow-hidden p-0">
            <div className="relative h-52">
              <ProfileImage src={testimonial.imageUrl} alt={testimonial.patientName} fill />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold">{testimonial.patientName}</h2>
              <p className="text-xs uppercase tracking-wide text-secondary">
                {testimonial.country} | {testimonial.treatment}
              </p>
              <p className="mt-2 text-sm text-muted">{testimonial.comment}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-muted">
                <Star className="h-4 w-4 text-amber-500" />
                {testimonial.rating}/5
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {testimonial.doctor ? <Link href={`/doctors/${testimonial.doctor.slug}`} className="font-semibold text-primary">Doctor profile</Link> : null}
                {testimonial.treatmentRef ? (
                  <Link href={`/treatments/${testimonial.treatmentRef.slug}`} className="font-semibold text-primary">
                    Treatment page
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
