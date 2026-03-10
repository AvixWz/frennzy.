import Link from "next/link";
import { ExternalLink, Globe, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileImage } from "@/components/ui/profile-image";
import { buildGoogleSearchLink, formatRating, getAverageRating, safeParseJson, stringifyDelimitedList } from "@/lib/utils";

interface DoctorCardProps {
  doctor: {
    id: string;
    slug: string;
    name: string;
    specialization: string;
    experienceYears: number;
    city: string;
    imageUrl: string;
    googleReviewUrl?: string | null;
    websiteUrl?: string | null;
    biography: string;
    languages: unknown;
    patientReviews?: unknown;
    hospital: {
      name: string;
    };
  };
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const reviews = Array.isArray(doctor.patientReviews)
    ? safeParseJson(JSON.stringify(doctor.patientReviews), [] as Array<{ rating: number }>)
    : [];
  const rating = getAverageRating(reviews);
  const googleLink = doctor.googleReviewUrl || buildGoogleSearchLink(doctor.name, doctor.city);

  return (
    <Card key={doctor.id} className="overflow-hidden p-0">
      <div className="relative h-56">
        <ProfileImage src={doctor.imageUrl} alt={doctor.name} fill />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">{doctor.specialization}</p>
            <h2 className="mt-2 text-xl font-semibold">{doctor.name}</h2>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{doctor.experienceYears} yrs</div>
        </div>
        <p className="mt-2 text-sm text-muted">{doctor.hospital.name}</p>
        <p className="mt-1 text-sm text-muted">{doctor.city}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            {formatRating(rating)}
          </span>
          <span>{stringifyDelimitedList(doctor.languages) || "International care support"}</span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm text-muted">{doctor.biography}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/doctors/${doctor.slug}`} className="text-sm font-semibold text-primary">
            View profile
          </Link>
          {doctor.websiteUrl ? (
            <a
              href={doctor.websiteUrl}
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
            Google profile <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
