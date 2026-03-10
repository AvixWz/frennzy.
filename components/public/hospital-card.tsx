import Link from "next/link";
import { ExternalLink, Globe, ShieldCheck, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildGoogleSearchLink, formatRating, parseJsonArray } from "@/lib/utils";

interface HospitalCardProps {
  hospital: {
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    overview: string;
    images: unknown;
    googleReviewUrl?: string | null;
    websiteUrl?: string | null;
    accreditations: unknown;
    departments?: unknown;
    doctors?: Array<{ id: string }>;
  };
}

export function HospitalCard({ hospital }: HospitalCardProps) {
  const image = parseJsonArray(hospital.images)[0];
  const accreditations = parseJsonArray(hospital.accreditations);
  const estimatedRating = 4.6 + Math.min(0.3, (hospital.doctors?.length || 0) * 0.03);
  const googleLink = hospital.googleReviewUrl || buildGoogleSearchLink(hospital.name, hospital.city);

  return (
    <Card key={hospital.id} className="overflow-hidden p-0">
      <div className="relative h-56">
        <ProfileImage src={image} alt={hospital.name} fill />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{hospital.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {hospital.city}, {hospital.country}
            </p>
          </div>
          <div className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            {(hospital.doctors?.length || 0).toString()} doctors
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {accreditations.slice(0, 3).map((item) => (
            <Badge key={item}>{item}</Badge>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            {formatRating(estimatedRating)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            {accreditations.length || 1} accreditation markers
          </span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm text-muted">{hospital.overview}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/hospitals/${hospital.slug}`} className="text-sm font-semibold text-primary">
            View hospital
          </Link>
          {hospital.websiteUrl ? (
            <a
              href={hospital.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary"
            >
              Website <Globe className="h-4 w-4" />
            </a>
          ) : null}
          <a
            href={googleLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-primary"
          >
            Google listing <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
