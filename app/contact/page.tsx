import { InquiryForm } from "@/components/forms/inquiry-form";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact & Free Consultation | Mediway",
  description:
    "Submit your treatment inquiry with patient details and receive a free consultation from Mediway's medical coordinators.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold">Contact & Free Consultation</h1>
          <p className="mt-3 text-muted">
            Share patient name, country, phone, email, treatment interest, and your message. Our experts typically respond within 24-48 hours.
          </p>

          <Card className="mt-8">
            <h2 className="text-xl font-semibold">Patient Support</h2>
            <p className="mt-2 text-sm text-muted">Email: care@mediway.com</p>
            <p className="text-sm text-muted">Phone: +91 98765 43210</p>
            <p className="text-sm text-muted">Availability: Monday to Saturday, 9:00 AM - 8:00 PM IST</p>
          </Card>
        </div>

        <InquiryForm />
      </div>
    </section>
  );
}
